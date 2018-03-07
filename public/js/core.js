window.onscroll = function() {
  if (window.pageYOffset > 10) {
    document.getElementById("Header").classList.add("scrolledHeader");
  } else {
    document.getElementById("Header").classList.remove("scrolledHeader");
  }
};
