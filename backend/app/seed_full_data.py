"""Populates rich, production-grade operational data across all 18 Admin sections for Prince Corner.
Can be executed safely anytime to ensure complete data availability.

Run with:
& "C:\\Users\\OM Sanjhira\\AppData\\Local\\Programs\\Python\\Python313\\python.exe" -m app.seed_full_data
"""

async_session_builder = None
import asyncio
from datetime import datetime, timedelta, timezone
from decimal import Decimal

from sqlalchemy import select, delete
from app.db.session import AsyncSessionLocal
from app.models.organization import Organization
from app.models.restaurant import Restaurant
from app.models.site_settings import SiteSettings
from app.models.table import RestaurantTable
from app.models.menu import MenuCategory, MenuItem, MenuItemVariant, MenuItemAddon
from app.models.promotions import Coupon, CouponTypeEnum, LoyaltyAccount
from app.models.reservation import Reservation, ReservationStatusEnum
from app.models.inventory import Ingredient, Supplier, MenuItemIngredient, InventoryTransferRequest, TransferStatusEnum
from app.models.user import User, RoleEnum
from app.models.order import Order, OrderItem, OrderStatusEnum
from app.models.billing import Invoice, InvoiceOrder, InvoiceStatusEnum, Payment, PaymentMethodEnum, PaymentStatusEnum
from app.core.security import hash_password

async def seed_all():
    async with AsyncSessionLocal() as db:
        # Find Prince Corner Organization & Isanpur Branch
        org = (await db.execute(select(Organization).where(Organization.slug == "prince-corner"))).scalar_one_or_none()
        if not org:
            org = (await db.execute(select(Organization))).scalars().first()
        
        restaurant = (await db.execute(select(Restaurant).where(Restaurant.slug == "prince-corner-isanpur"))).scalar_one_or_none()
        if not restaurant:
            restaurant = (await db.execute(select(Restaurant).where(Restaurant.organization_id == org.id))).scalars().first()

        print(f"Seeding full data for Org: {org.name} | Branch: {restaurant.name} ({restaurant.id})")

        # 1. Site Settings
        site = (await db.execute(select(SiteSettings).where(SiteSettings.restaurant_id == restaurant.id))).scalar_one_or_none()
        if not site:
            site = SiteSettings(restaurant_id=restaurant.id)
            db.add(site)
        site.name = "Prince Corner"
        site.tagline = "Authentic Flavor • Unmatched Hospitality • Since 1998"
        site.description = "Welcome to Prince Corner — Isanpur's favorite dining destination for authentic South Indian, Punjabi Delicacies, Chinese Specialties, and handcrafted Fast Food & Beverages."
        site.announcement_text = "🔥 Special Offer: Flat 20% OFF on all Dine-in & Online Orders! Use Code: PRINCE20"
        site.announcement_enabled = True
        site.logo_url = "/princelogo.png"
        site.primary_color = "#b71c1c"
        site.accent_color = "#D4AF37"
        site.hidden_pages = []

        # 2. Tables (T1 through T10)
        existing_tables = (await db.execute(select(RestaurantTable).where(RestaurantTable.restaurant_id == restaurant.id))).scalars().all()
        table_codes = {t.code for t in existing_tables}
        for i in range(1, 11):
            code = f"T{i}"
            if code not in table_codes:
                db.add(RestaurantTable(restaurant_id=restaurant.id, code=code, is_active=True))

        # 3. Categories & Menu Items
        cat_data = [
            ("Starters & Snacks", "starters", 1),
            ("South Indian Specials", "south-indian", 2),
            ("Main Course (Punjabi)", "main-course", 3),
            ("Fast Food & Pizza", "fast-food", 4),
            ("Beverages & Shakes", "beverages", 5),
            ("Desserts", "desserts", 6),
        ]
        
        cats_by_slug = {}
        for name, slug, sort in cat_data:
            cat = (await db.execute(select(MenuCategory).where(
                MenuCategory.restaurant_id == restaurant.id,
                MenuCategory.slug == slug
            ))).scalar_one_or_none()
            if not cat:
                cat = MenuCategory(restaurant_id=restaurant.id, name=name, slug=slug, sort_order=sort)
                db.add(cat)
                await db.flush()
            cats_by_slug[slug] = cat

        menu_items_spec = [
            # Starters
            ("starters", "Paneer Tikka Grill", "Fresh paneer marinated in spicy yogurt & tandoori spices.", "240.00", ["Full", "Half"], [("Extra Cheese", "40.00"), ("Mint Chutney", "20.00")]),
            ("starters", "Veg Hara Bhara Kebab", "Spinach & green pea patties spiced with garam masala.", "180.00", [], [("Extra Dip", "20.00")]),
            ("starters", "Cheese Garlic Bread", "Crispy oven-baked baguette topped with garlic butter & mozzarella.", "160.00", [], [("Extra Cheese", "30.00")]),
            ("starters", "Crispy Spicy Corn", "Golden fried sweet corn tossed with capsicum and herbs.", "190.00", [], []),

            # South Indian
            ("south-indian", "Prince Special Butter Masala Dosa", "Crispy golden crepe filled with spiced potato masala and fresh butter.", "140.00", ["Regular", "Jain"], [("Extra Sambhar", "25.00"), ("Cheese Topping", "35.00")]),
            ("south-indian", "Cheese Mysuru Dosa", "Spicy Mysuru red chutney spread with generous melted cheese.", "170.00", [], []),
            ("south-indian", "Rava Onion Dosa", "Crispy semolina dosa laced with finely chopped onions & green chillies.", "150.00", [], []),
            ("south-indian", "Steamed Idli Sambhar (2 pcs)", "Soft fluffy rice cakes served with aromatic lentil sambhar & coconut chutney.", "90.00", [], []),

            # Main Course
            ("main-course", "Paneer Butter Masala", "Cottage cheese cubes cooked in rich tomato cashew cream gravy.", "260.00", ["Full", "Half"], [("Extra Butter", "25.00")]),
            ("main-course", "Kaju Curry Special", "Roasted cashews cooked in rich golden gravy with aromatic spices.", "280.00", [], []),
            ("main-course", "Dal Makhani Deluxe", "Black lentils slow-cooked overnight with cream and butter.", "220.00", [], []),
            ("main-course", "Amul Butter Naan", "Soft clay-oven bread brushed with fresh Amul butter.", "45.00", [], []),
            ("main-course", "Jeera Basmati Rice", "Fragrant basmati rice tempered with cumin seeds & ghee.", "150.00", [], []),

            # Fast Food
            ("fast-food", "Prince Supreme Veg Pizza", "Loaded with onions, capsicum, corn, olives & 100% mozzarella cheese.", "290.00", ["Medium 8\"", "Large 10\""], [("Cheese Burst Crust", "60.00")]),
            ("fast-food", "Cheese Grilled Sandwich", "Triple layer jumbo sandwich stuffed with veggies & melted cheese.", "160.00", [], [("Schezwan Spread", "20.00")]),
            ("fast-food", "Veg Hakka Noodles", "Wok-tossed noodles with crunchy spring veggies & soya sauce.", "180.00", [], []),
            ("fast-food", "Veg Manchurian Gravy", "Crispy veg balls tossed in tangy garlic soya sauce.", "190.00", [], []),

            # Beverages
            ("beverages", "Thick Cold Coffee with Ice Cream", "Rich espresso blended with chilled milk and topped with vanilla scoop.", "120.00", [], []),
            ("beverages", "Royal Rose Falooda", "Traditional rose syrup drink with vermicelli, basil seeds & ice cream.", "150.00", [], []),
            ("beverages", "Fresh Lime Soda", "Refreshing sparkling soda with fresh lemon juice & mint.", "60.00", [], []),
            ("beverages", "Mango Lassi", "Creamy sweet yogurt drink infused with Alphonso mango pulp.", "90.00", [], []),

            # Desserts
            ("desserts", "Gulab Jamun with Vanilla Ice Cream", "Hot soft gulab jamuns served alongside cold vanilla ice cream.", "110.00", [], []),
            ("desserts", "Sizzling Chocolate Brownie", "Warm chocolate brownie served on sizzling platter with hot fudge & ice cream.", "190.00", [], []),
        ]

        for cat_slug, item_name, desc, price, variants, addons in menu_items_spec:
            cat = cats_by_slug[cat_slug]
            item = (await db.execute(select(MenuItem).where(
                MenuItem.restaurant_id == restaurant.id,
                MenuItem.name == item_name
            ))).scalar_one_or_none()
            if not item:
                item = MenuItem(
                    restaurant_id=restaurant.id,
                    category_id=cat.id,
                    name=item_name,
                    description=desc,
                    base_price=Decimal(price),
                    is_available=True
                )
                db.add(item)
                await db.flush()
            
            # Add variants
            for v_name in variants:
                v_price = str(Decimal(price) * Decimal("0.6") if "Half" in v_name else Decimal(price))
                v_exist = (await db.execute(select(MenuItemVariant).where(MenuItemVariant.menu_item_id == item.id, MenuItemVariant.name == v_name))).scalar_one_or_none()
                if not v_exist:
                    db.add(MenuItemVariant(menu_item_id=item.id, name=v_name, price=Decimal(v_price)))
            
            # Add addons
            for a_name, a_price in addons:
                a_exist = (await db.execute(select(MenuItemAddon).where(MenuItemAddon.menu_item_id == item.id, MenuItemAddon.name == a_name))).scalar_one_or_none()
                if not a_exist:
                    db.add(MenuItemAddon(menu_item_id=item.id, name=a_name, price=Decimal(a_price)))

        # 4. Coupons
        coupons_spec = [
            ("PRINCE20", CouponTypeEnum.percentage, "20.00", "300.00", "100.00"),
            ("WELCOME50", CouponTypeEnum.flat, "50.00", "200.00", None),
            ("FLAT100", CouponTypeEnum.flat, "100.00", "500.00", None),
            ("BOGOCHEESE", CouponTypeEnum.bogo, "0.00", "250.00", None),
        ]
        for code, ctype, val, min_ord, max_disc in coupons_spec:
            c_exist = (await db.execute(select(Coupon).where(Coupon.restaurant_id == restaurant.id, Coupon.code == code))).scalar_one_or_none()
            if not c_exist:
                db.add(Coupon(
                    restaurant_id=restaurant.id,
                    code=code,
                    type=ctype,
                    value=Decimal(val),
                    min_order_amount=Decimal(min_ord),
                    max_discount=Decimal(max_disc) if max_disc else None,
                    is_active=True
                ))

        # 5. Loyalty Accounts
        loyalty_spec = [
            ("+919876543210", 450),
            ("+919825012345", 720),
            ("+919909011223", 280),
            ("+919898033445", 150),
            ("+919712955667", 890),
        ]
        for phone, points in loyalty_spec:
            l_exist = (await db.execute(select(LoyaltyAccount).where(LoyaltyAccount.restaurant_id == restaurant.id, LoyaltyAccount.phone == phone))).scalar_one_or_none()
            if not l_exist:
                db.add(LoyaltyAccount(restaurant_id=restaurant.id, phone=phone, points=points))

        # 6. Suppliers & Ingredients
        suppliers_spec = ["Gujarat Dairy Co.", "Apex Spices & Grains", "FreshVeggies Wholesale", "Prince Bakery Supplies"]
        sup_objs = {}
        for sname in suppliers_spec:
            sup = (await db.execute(select(Supplier).where(Supplier.restaurant_id == restaurant.id, Supplier.name == sname))).scalar_one_or_none()
            if not sup:
                sup = Supplier(restaurant_id=restaurant.id, name=sname)
                db.add(sup)
                await db.flush()
            sup_objs[sname] = sup

        ing_spec = [
            ("Amul Fresh Paneer", "kg", "18.5", "5.0", "Gujarat Dairy Co."),
            ("Amul Butter", "kg", "12.0", "3.0", "Gujarat Dairy Co."),
            ("Mozzarella Cheese", "kg", "15.0", "4.0", "Gujarat Dairy Co."),
            ("Fresh Farm Tomatoes", "kg", "35.0", "10.0", "FreshVeggies Wholesale"),
            ("Basmati Rice (Kohinoor)", "kg", "50.0", "15.0", "Apex Spices & Grains"),
            ("Refined Cooking Oil", "L", "25.0", "8.0", "Apex Spices & Grains"),
            ("Amul Gold Milk", "L", "40.0", "12.0", "Gujarat Dairy Co."),
        ]
        for iname, unit, qty, thresh, sname in ing_spec:
            ing = (await db.execute(select(Ingredient).where(Ingredient.restaurant_id == restaurant.id, Ingredient.name == iname))).scalar_one_or_none()
            if not ing:
                db.add(Ingredient(
                    restaurant_id=restaurant.id,
                    supplier_id=sup_objs[sname].id,
                    name=iname,
                    unit=unit,
                    stock_quantity=Decimal(qty),
                    low_stock_threshold=Decimal(thresh)
                ))

        # 7. Reservations
        now = datetime.now(timezone.utc)
        res_spec = [
            ("Ramesh Patel", "+919824011223", 4, (now + timedelta(hours=3)).date(), (now + timedelta(hours=3)).time(), ReservationStatusEnum.confirmed, "Window seat requested", "RES-101"),
            ("Sunita Verma", "+919712033445", 2, (now + timedelta(hours=6)).date(), (now + timedelta(hours=6)).time(), ReservationStatusEnum.pending, "Anniversary dinner", "RES-102"),
            ("Vikram Shah", "+919898122334", 6, (now + timedelta(days=1)).date(), (now + timedelta(days=1)).time(), ReservationStatusEnum.confirmed, "High chair needed", "RES-103"),
            ("Kavita Joshi", "+919876112233", 3, (now - timedelta(days=1)).date(), (now - timedelta(days=1)).time(), ReservationStatusEnum.confirmed, "Completed booking", "RES-104"),
        ]
        for g_name, phone, count, rdate, rtime, status, notes, ref_code in res_spec:
            r_exist = (await db.execute(select(Reservation).where(Reservation.restaurant_id == restaurant.id, Reservation.name == g_name))).scalar_one_or_none()
            if not r_exist:
                db.add(Reservation(
                    restaurant_id=restaurant.id,
                    reference_code=ref_code,
                    name=g_name,
                    phone=phone,
                    party_size=count,
                    date=rdate,
                    time=rtime,
                    status=status,
                    note=notes
                ))

        # 8. Staff Users
        staff_spec = [
            ("Prince Owner", "owner@princecorner.example.com", RoleEnum.owner),
            ("Isanpur Branch Manager", "manager@princecorner.example.com", RoleEnum.manager),
            ("Head Cashier", "cashier@princecorner.example.com", RoleEnum.cashier),
            ("Executive Chef", "kitchen@princecorner.example.com", RoleEnum.kitchen),
            ("Senior Waiter", "waiter@princecorner.example.com", RoleEnum.waiter),
        ]
        for sname, email, role in staff_spec:
            u_exist = (await db.execute(select(User).where(User.email == email))).scalar_one_or_none()
            if not u_exist:
                db.add(User(
                    organization_id=org.id,
                    restaurant_id=restaurant.id,
                    name=sname,
                    email=email,
                    password_hash=hash_password("PrinceCorner@123"),
                    role=role,
                    is_active=True
                ))

        # 9. Active & Recent Live Orders + Invoices
        all_tables_map = {t.code: t.id for t in (await db.execute(select(RestaurantTable).where(RestaurantTable.restaurant_id == restaurant.id))).scalars().all()}
        all_menu_items = (await db.execute(select(MenuItem).where(MenuItem.restaurant_id == restaurant.id))).scalars().all()
        if all_menu_items and len(all_menu_items) >= 4 and "T1" in all_tables_map:
            item1, item2, item3, item4 = all_menu_items[0], all_menu_items[1], all_menu_items[4], all_menu_items[8]
            
            orders_data = [
                ("T1", OrderStatusEnum.received, "dine_in", [(item1, 2), (item2, 1)], "Extra spicy please"),
                ("T3", OrderStatusEnum.preparing, "dine_in", [(item3, 1), (item4, 2)], "Less oil in curry"),
                ("T5", OrderStatusEnum.ready, "dine_in", [(item1, 1), (item4, 1)], "Serve drinks first"),
                ("T2", OrderStatusEnum.served, "dine_in", [(item2, 2), (item3, 2)], ""),
                ("T4", OrderStatusEnum.served, "online", [(item1, 1), (item3, 1)], "Parcel packing required"),
            ]

            for tcode, ostatus, channel, lines, note in orders_data:
                tid = all_tables_map.get(tcode, all_tables_map["T1"])
                total_amt = sum(item.base_price * qty for item, qty in lines)
                dcode = f"ORD-{tcode}-{ostatus.value.upper()[:3]}"
                ord_exist = (await db.execute(select(Order).where(Order.restaurant_id == restaurant.id, Order.display_code == dcode))).scalar_one_or_none()
                if not ord_exist:
                    new_ord = Order(
                        restaurant_id=restaurant.id,
                        table_id=tid,
                        display_code=dcode,
                        channel=channel,
                        status=ostatus,
                        subtotal=total_amt,
                        total=total_amt,
                        note=note or ""
                    )
                    db.add(new_ord)
                    await db.flush()

                    for item, qty in lines:
                        db.add(OrderItem(
                            order_id=new_ord.id,
                            menu_item_id=item.id,
                            name_snapshot=item.name,
                            unit_price_snapshot=item.base_price,
                            quantity=qty,
                            line_total=item.base_price * qty
                        ))
                    
                    # Create invoice & payment for served order
                    if ostatus == OrderStatusEnum.served:
                        tax = total_amt * Decimal("0.05") # 5% GST
                        grand_total = total_amt + tax
                        inv = Invoice(
                            restaurant_id=restaurant.id,
                            table_id=tid,
                            subtotal=total_amt,
                            discount_amount=Decimal("0.00"),
                            tax_amount=tax,
                            total=grand_total,
                            status=InvoiceStatusEnum.paid
                        )
                        db.add(inv)
                        await db.flush()
                        
                        db.add(InvoiceOrder(invoice_id=inv.id, order_id=new_ord.id))
                        db.add(Payment(
                            invoice_id=inv.id,
                            amount=grand_total,
                            method=PaymentMethodEnum.cash,
                            status=PaymentStatusEnum.succeeded
                        ))

        await db.commit()
        print("Successfully populated rich operational data for all 18 Admin sections!")

if __name__ == "__main__":
    asyncio.run(seed_all())
