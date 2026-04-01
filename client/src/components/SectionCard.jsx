const SectionCard = ({ title, description, className = "", children }) => (
  <section className={`section-card ${className}`.trim()}>
    <div className="section-heading">
      <div>
        <h2>{title}</h2>
        {description ? <p>{description}</p> : null}
      </div>
    </div>
    {children}
  </section>
);

export default SectionCard;

