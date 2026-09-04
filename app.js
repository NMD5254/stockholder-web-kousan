/*
 * 全角英数字を半角英数字へ変換する
 */
function toHalfWidth(value) {
    return value.replace(
        /[０-９Ａ-Ｚａ-ｚ]/g,
        function (character) {
            return String.fromCharCode(
                character.charCodeAt(0) - 0xFEE0
            );
        }
    );
}


/*
 * HTMLの読み込み完了後に入力制御を設定する
 */
document.addEventListener(
    "DOMContentLoaded",
    function () {
        const stockNoInput =
            document.getElementById("stockNo");

        const authCodeInput =
            document.getElementById("authCode");

        /*
         * 株主番号
         * ・全角数字を半角数字へ変換
         * ・数字以外を除去
         * ・4桁までに制限
         */
        stockNoInput.addEventListener(
            "input",
            function () {
                this.value =
                    toHalfWidth(this.value)
                        .replace(/[^0-9]/g, "")
                        .slice(0, 4);
            }
        );

        /*
         * 認証コード
         * ・全角英数字を半角へ変換
         * ・小文字を大文字へ変換
         * ・英数字以外を除去
         * ・6文字までに制限
         */
        authCodeInput.addEventListener(
            "input",
            function () {
                this.value =
                    toHalfWidth(this.value)
                        .toUpperCase()
                        .replace(/[^A-Z0-9]/g, "")
                        .slice(0, 6);
            }
        );
    }
);


/*
 * ログイン処理
 */
async function login() {

    /*
     * 送信直前にも入力値を整形する。
     * 貼り付けやブラウザー差異への補助対策。
     */
    const stockNo =
        toHalfWidth(
            document.getElementById("stockNo").value
        )
            .replace(/[^0-9]/g, "")
            .slice(0, 4);

    const authCode =
        toHalfWidth(
            document.getElementById("authCode").value
        )
            .toUpperCase()
            .replace(/[^A-Z0-9]/g, "")
            .slice(0, 6);

    /*
     * 整形後の値を入力欄にも反映する
     */
    document.getElementById("stockNo").value =
        stockNo;

    document.getElementById("authCode").value =
        authCode;

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
            "https://func-stockholder-auth22-ebg8c2cqb3eqdthu.japanwest-01.azurewebsites.net/api/login-kousan",
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
