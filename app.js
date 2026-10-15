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
 * 株主番号を整形する
 */
function normalizeStockNo(value) {
    return toHalfWidth(value)
        .replace(/[^0-9]/g, "")
        .slice(0, 4);
}


/*
 * 認証コードを整形する
 */
function normalizeAuthCode(value) {
    return toHalfWidth(value)
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, "")
        .slice(0, 6);
}


/*
 * IME入力状態
 */
let stockNoIsComposing = false;
let authCodeIsComposing = false;


/*
 * IME確定直後のEnterによる
 * ログイン処理を防止する
 */
let compositionJustEnded = false;


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
         * 株主番号のIME入力開始
         */
        stockNoInput.addEventListener(
            "compositionstart",
            function () {
                stockNoIsComposing = true;
            }
        );


        /*
         * 株主番号のIME入力確定
         */
        stockNoInput.addEventListener(
            "compositionend",
            function () {
                stockNoIsComposing = false;
                compositionJustEnded = true;

                this.value =
                    normalizeStockNo(this.value);

                setTimeout(
                    function () {
                        compositionJustEnded = false;
                    },
                    200
                );
            }
        );


        /*
         * 株主番号の通常入力
         *
         * IME入力中は値を書き換えない
         */
        stockNoInput.addEventListener(
            "input",
            function (event) {

                if (
                    stockNoIsComposing ||
                    event.isComposing
                ) {
                    return;
                }

                this.value =
                    normalizeStockNo(this.value);
            }
        );


        /*
         * 認証コードのIME入力開始
         */
        authCodeInput.addEventListener(
            "compositionstart",
            function () {
                authCodeIsComposing = true;
            }
        );


        /*
         * 認証コードのIME入力確定
         */
        authCodeInput.addEventListener(
            "compositionend",
            function () {
                authCodeIsComposing = false;
                compositionJustEnded = true;

                this.value =
                    normalizeAuthCode(this.value);

                setTimeout(
                    function () {
                        compositionJustEnded = false;
                    },
                    200
                );
            }
        );


        /*
         * 認証コードの通常入力
         *
         * IME入力中は値を書き換えない
         */
        authCodeInput.addEventListener(
            "input",
            function (event) {

                if (
                    authCodeIsComposing ||
                    event.isComposing
                ) {
                    return;
                }

                this.value =
                    normalizeAuthCode(this.value);
            }
        );


        /*
         * IME確定用のEnterが
         * ログイン操作になることを防止する
         */
        document.addEventListener(
            "keydown",
            function (event) {

                if (event.key !== "Enter") {
                    return;
                }

                if (
                    event.isComposing ||
                    event.keyCode === 229 ||
                    stockNoIsComposing ||
                    authCodeIsComposing ||
                    compositionJustEnded
                ) {
                    event.preventDefault();
                    event.stopPropagation();
                }
            },
            true
        );
    }
);


/*
 * 日選興産用ログイン処理
 */
async function login() {

    /*
     * IME入力中または変換直後は
     * ログイン処理を実行しない
     */
    if (
        stockNoIsComposing ||
        authCodeIsComposing ||
        compositionJustEnded
    ) {
        return;
    }


    const stockNoInput =
        document.getElementById("stockNo");

    const authCodeInput =
        document.getElementById("authCode");


    /*
     * 送信直前にも入力値を整形する
     */
    const stockNo =
        normalizeStockNo(stockNoInput.value);

    const authCode =
        normalizeAuthCode(authCodeInput.value);


    /*
     * 整形した値を入力欄にも反映する
     */
    stockNoInput.value =
        stockNo;

    authCodeInput.value =
        authCode;


    const message =
        document.getElementById("message");

    const loginButton =
        document.querySelector("button");


    /*
     * 桁数が不足している場合は送信しない
     */
    if (
        stockNo.length !== 4 ||
        authCode.length !== 6
    ) {
        message.innerText =
            "株主番号は4桁、認証コードは6文字で入力してください。";

        message.className =
            "error";

        return;
    }


    message.innerText =
        "認証中...";

    message.className =
        "";

    loginButton.disabled =
        true;

    loginButton.innerText =
        "認証中...";


    try {

        /*
         * 日選興産用API
         */
        const apiUrl =
            "https:" +
            "//func-stockholder-auth22-ebg8c2cqb3eqdthu" +
            ".japanwest-01.azurewebsites.net" +
            "/api/login-kousan";


        const response = await fetch(
            apiUrl,
            {
                method: "POST",
                headers: {
                    "Content-Type":
                        "application/json"
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

            loginButton.disabled =
                false;

            loginButton.innerText =
                "ログイン";
        }

    } catch (error) {

        message.innerText =
            "システムに接続できません。しばらくしてから再度お試しください。";

        message.className =
            "error";

        loginButton.disabled =
            false;

        loginButton.innerText =
            "ログイン";

        console.error(error);
    }
}
