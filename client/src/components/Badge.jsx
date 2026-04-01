const Badge = ({ children, tone = "neutral" }) => (
  <span className={`badge badge-${tone}`}>{children}</span>
);

export default Badge;

