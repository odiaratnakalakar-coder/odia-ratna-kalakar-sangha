// Welcome Message
window.onload = function () {
    console.log("Odia Ratna Kalakar Sangha Surat Website Loaded");
};

// Mobile Menu (ଯଦି ମେନୁ ବଟନ୍ ଥାଏ)
function toggleMenu() {
    const nav = document.getElementById("navMenu");
    if (nav) {
        nav.classList.toggle("show");
    }
}

// Contact Button
function contactMessage() {
    alert("ଧନ୍ୟବାଦ! ଓଡ଼ିଆ ରତ୍ନ କଳାକାର ସଂଘ ସୁରତ ସହ ଯୋଗାଯୋଗ କରିଥିବାରୁ।");
}

// Scroll to Top Button
const topBtn = document.getElementById("topBtn");

window.onscroll = function () {
    if (topBtn) {
        if (document.body.scrollTop > 100 || document.documentElement.scrollTop > 100) {
            topBtn.style.display = "block";
        } else {
            topBtn.style.display = "none";
        }
    }
};

function topFunction() {
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}
