// Equivariance gallery tab switching. Each .edf-tabs names its panel set via
// data-controls, and buttons name a panel id suffix via data-run. Panels use
// data-group and toggle via the hidden attribute so only the selected
// object's strip shows. The container must not use data-group itself, or the
// panel query would match the tab bar and hide it on the first click.
document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('.edf-tabs').forEach(function (tabs) {
    var group = tabs.getAttribute('data-controls');
    tabs.querySelectorAll('.edf-tab').forEach(function (btn) {
      btn.addEventListener('click', function () {
        tabs.querySelectorAll('.edf-tab').forEach(function (b) {
          b.setAttribute('aria-selected', b === btn ? 'true' : 'false');
        });
        document.querySelectorAll('[data-group="' + group + '"]').forEach(function (panel) {
          panel.hidden = panel.id !== group + '-' + btn.getAttribute('data-run');
        });
      });
    });
  });
});
