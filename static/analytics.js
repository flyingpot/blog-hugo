window.dataLayer = window.dataLayer || [];
// get domain
var domain = window.location.host;
// get userId
var userId = window.localStorage.getItem("userId");

function gtag() {
  dataLayer.push(arguments);
}
function analytics() {
  gtag("js", new Date());
  gtag("config", "UA-132076423-1");
  if (
    domain &&
    (domain.indexOf("localhost") >= 0 || domain.indexOf("127.0.0.1") >= 0)
  ) {
    return;
  }
  var event_action = "login";
  if (!userId) {
    userId = Math.floor(Math.random() * 1000000000000);
    window.localStorage.setItem("userId", userId);
    event_action = "register";
  }
  gtag("set", { user_id: userId });
  gtag("event", event_action, {
    event_category: "user",
    event_label: domain
  });
}

analytics();
