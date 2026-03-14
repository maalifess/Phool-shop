const MarqueeBanner = () => {
  const items = ["sirf aapke liye", "everything handmade", "shop now"];

  const content = items.map((item, i) => (
    <span key={i} className="flex items-center gap-6 mx-6">
      <span className="font-heading text-lg md:text-xl tracking-widest text-[#6e4248]">{item}</span>
      <span className="text-[#6e4248] text-2xl">🌸</span>
    </span>
  ));

  return (
    <div className="bg-[#cfd9b6] py-3 border-y-[3px] border-[#6e4248] overflow-hidden polka-dots">
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
