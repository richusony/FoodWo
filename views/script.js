console.log("start");
resendOtp.addEventListener("click", async () => {await fetch("/user/signup", {method: "POST"})})
console.log("end");