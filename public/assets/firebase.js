// Your web app's Firebase configuration

var firebaseConfig = {
    apiKey: "AIzaSyCLMfpoA3T2bGWQVvN_7B7k52dIWf5Pyvg",
    authDomain: "speakout-1.firebaseapp.com",
    databaseURL: "https://speakout-1.firebaseio.com",
    projectId: "speakout-1",
    storageBucket: "",
    messagingSenderId: "819132371766",
    appId: "1:819132371766:web:24b48739284262b0"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);


function getCookieValue(a) {
    var b = document.cookie.match('(^|[^;]+)\\s*' + a + '\\s*=\\s*([^;]+)');
    return b ? b.pop() : '';
}

const messaging = firebase.messaging();
messaging.requestPermission()
    .then(() => {
        return messaging.getToken();

    })
    .then((token) => {
        if (getCookieValue("isUpdated") !== "yes") {
            console.log(token);
            $.post("/web/update", {fcm: token}, function (data, status) {
                console.log(status)
            });
        }

    })
    .catch(() => {
        alert("You need to allow this permission !")
    });

messaging.onMessage((payload) => {
    console.log(payload);
});
