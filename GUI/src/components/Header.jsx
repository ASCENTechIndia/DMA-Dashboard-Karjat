function Header({
  title = "DMA Dashboard",
  orgName = "Municipal Corporation",
  brandName = "Nagar Karyawali",
}) {
  return (
    <header className="dma-header">
      <div className="dma-header-logo">
        <span className="">
          <img
            src="/Images/AscenTech_Logomini.png"
            alt="AscenTech Logo"
            className="dma-header-logo-img"
          />
        </span>
      </div>

      <h1 className="dma-header-title">{title}</h1>

      <div className="dma-header-brand">
        <img
            src="/Images/MasterPageLogo.png"
            alt="AscenTech Logo"
            className="dma-header-logo-img1"
          />
        {/* <span className="dma-header-brand-text">{brandName}</span> */}
      </div>
    </header>
  );
}

export default Header;
