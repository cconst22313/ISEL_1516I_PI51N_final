'use strict';


window.onload = function () {
    Array.prototype.forEach.call(document.querySelectorAll("a.delete-fav")
        , a => a.onclick = processDelete );

    function processDelete() {
        console.log(this.href);
        makeHttpRequest("DELETE", this.href, deleteFavourite);

        return false;

        function deleteFavourite(rsp) {
            console.log("Response" + rsp);
            var obj = JSON.parse(rsp);
            console.log("ID: "+obj.id);
            var div = document.getElementById(obj.id);
            div.parentNode.removeChild(div);
        }
    }

    function makeHttpRequest(method, uri, cb, formData) {
        //uri = prefixUriWith(uri, API_PREFIX);

        let xhr = new XMLHttpRequest();

        method = method.toUpperCase();
        console.log("uri", uri);
        console.log("method", method);
        xhr.open(method, uri);

        xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

        var body = createBodyString(formData);
        console.log(body);
        xhr.send(body);

        xhr.onreadystatechange = function () {
            console.log("onreadystatechange: " + xhr.readyState);
            if (xhr.readyState == 4 && xhr.status == 200) {
                console.log("Server replied with :", xhr.status);
                cb(xhr.responseText);
            }
        }
    }

    function createBodyString(formData) {
        if (!formData) {
            return null;
        }

        let str = "";
        for (let k in formData) {
            str += k + "=" + formData[k] + "&";
        }

        return str.substring(0, str.length - 1);
    }

    let submitBtn = document.getElementById("submit-group");

    submitBtn.onclick = function () {
        var formData = {};

        let method = document.getElementById("favourite-new-form").method;
        let uri = document.getElementById("favourite-new-form").action;

        var formElems = document.querySelectorAll("input,select");
        Array.prototype.forEach.call(formElems, fe => {
                if(fe.name) formData[fe.name] = fe.value;
            }
        );

        console.log(formData);

        makeHttpRequest(method, uri, insertNewFavourite, formData);

        return false;
    }

    function insertNewFavourite(favHtml) {
        document.getElementById("favourites").innerHTML += favHtml;
    }

};