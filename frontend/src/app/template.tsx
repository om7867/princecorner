/**
 * Route transition: every navigation re-mounts this template, playing a
 * short saffron wipe + content rise so moving between worlds feels like
 * walking through a doorway, not loading a new site.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="route-transition">{children}</div>;
}
