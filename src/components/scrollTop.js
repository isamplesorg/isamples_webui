import React, { useEffect, useState } from "react";

// https://www.coderomeos.org/scroll-to-top-of-the-page-a-simple-react-component
// the source code
export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  // Show button when page is scorlled upto given distance
  const toggleVisibility = () => {
    if (window.pageYOffset > window.innerHeight * 0.2) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  // Set the top cordinate to 0
  // make scrolling smooth
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  useEffect(() => {
    window.addEventListener("scroll", toggleVisibility);
  }, []);

  return (
    <div className="scroll-to-top">
      {isVisible &&
        <div onClick={scrollToTop}>
          <span className="glyphicon glyphicon-circle-arrow-up"/>
        </div>}
    </div>
  );
}
