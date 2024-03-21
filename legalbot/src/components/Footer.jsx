import React from "react";
const Footer = () => {
  const currentYear = new Date().getFullYear();

  return <div className="footer">I am Nikhil - &copy;{currentYear}</div>;
};

export default Footer;
