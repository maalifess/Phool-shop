const MarqueeBanner = () => {
  const items = ["sirf aapke liye", "everything handmade", "shop now"];

  const content = items.map((item, i) => (
    <span key={i} className="flex items-center gap-6 mx-6">
      <span className="font-heading text-lg md:text-xl tracking-widest text-foreground">{item}</span>
      <span className="text-secondary text-2xl">🌸</span>
    </span>
  ));

  return (
    <div className="bg-[#F7D9E0] py-3 border-y-[3px] border-foreground overflow-hidden polka-dots">
      <div className="marquee-track">
        <div className="flex">{content}</div>
        <div className="flex">{content}</div>
        <div className="flex">{content}</div>
        <div className="flex">{content}</div>
      </div>
    </div>
  );
};

export default MarqueeBanner;
