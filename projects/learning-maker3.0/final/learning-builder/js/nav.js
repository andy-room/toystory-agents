/* ══ 사이드바 토글 ══ */
let _navOpen = window.innerWidth > 1280;

function updateNavState() {
  document.body.classList.toggle('nav-collapsed', !_navOpen);
  const overlay = document.getElementById('navOverlay');
  if (overlay) overlay.classList.toggle('visible', _navOpen && window.innerWidth <= 1280);
}

function toggleNav() { _navOpen = !_navOpen; updateNavState(); }
function closeNav()  { _navOpen = false;      updateNavState(); }

window.addEventListener('resize', function() {
  if (window.innerWidth <= 1280 && _navOpen) { _navOpen = false; updateNavState(); }
});
