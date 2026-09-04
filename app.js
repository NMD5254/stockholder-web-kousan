async function login() {

    const stockNo =
        document.getElementById("stockNo").value;

    const authCode =
        document.getElementById("authCode").value;

    const message =
        document.getElementById("message");

    const loginButton =
        document.querySelector("button");

    message.innerText = "認証中...";
    message.className = "";

    loginButton.disabled = true;
    loginButton.innerText = "認証中...";

    try {

        const response = await fetch(
            "https://func-stockholder-auth22-ebg8c2cqb3eqdthu.japanwest-01.azurewebsites.net/api/login",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    stockNo: stockNo,
                    authCode: authCode
                })
            }
        );

        const result =
            await response.json();

        if (result.success) {

            window.location.href =
                result.pdfUrl;

        } else {

            message.innerText =
                result.message ||
                "株主番号または認証コードが正しくありません。";

            message.className =
                "error";

            loginButton.disabled = false;
            loginButton.innerText = "ログイン";
        }

    } catch (error) {

        message.innerText =
            "システムに接続できません。しばらくしてから再度お試しください。";

        message.className =
            "error";

        loginButton.disabled = false;
        loginButton.innerText = "ログイン";

        console.error(error);
    }
}
