const MarqueeBanner = () => {
  const items = ["CROCHET", "HANDMADE", "BOUQUETS", "AMIGURUMI", "CUSTOM ORDERS", "ACCESSORIES"];

  const content = items.map((item, i) => (
    <span key={i} className="flex items-center gap-6 mx-6">
      <span className="font-heading text-lg md:text-xl uppercase tracking-widest text-foreground">{item}</span>
      <span className="text-secondary text-2xl">🌸</span>
    </span>
  ));

  return (
    <div className="bg-golden py-3 border-y-[3px] border-foreground overflow-hidden polka-dots">
      <div className="marquee-track">
        <div className="flex">{content}</div>
        <div className="flex">{content}</div>
      </div>
    </div>
  );
};

export default MarqueeBanner;
