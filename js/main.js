$(function () {
    var token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiODRtSEdPb2NCVSIsInBhc3N3b3JkIjoiRWlld3FKbTh2T1NqWlpwRUJGemZOd0ZzNjJQbWNtTUg0N1VIdGlCOW4yejFOTVVEOVlZc05MVmgzcnMwYzdBViIsImFkbWluIjpmYWxzZSwiaWF0IjoxNTM0NTAyMzUzLCJleHAiOjE1NjYwMzgzNTN9.DX-WbSqF7V0-qjkqr0PLiCfAPeMt65xnNlDn_xV6UjE';


    // blocknumber
    $("body").on('click', '#fn-blocknumber', function () {
        callRPC("getblockcount", []);
    });

    // wallet new
    $("body").on('click', '#fn-wallet-new', function () {
        callRPC("createwallet", []);
    });

    // wallet check
    $("body").on('click', '#fn-wallet-check', function () {
        var wallet_address = $('#pm-wallet-check').val();
        if (!wallet_address) {
            alert("no wallet address")
            return;
        }
        callRPC("validateaddress", [wallet_address]);
    });

    // balance
    $("body").on('click', '#fn-balance', function () {
        var wallet_address = $('#pm-balance').val();
        if (!wallet_address) {
            alert("no wallet address")
            return;
        }
        callRPC("getaccountstate", [wallet_address]);
    });

    // transfer
    $("body").on('click', '#fn-transfer', function () {

        var password = $('#pm-transfer-0').val();
        var asset = $('#pm-transfer-1').val();
        var toAddress = $('#pm-transfer-2').val();
        var amount = $('#pm-transfer-3').val();
        var fee = $('#pm-transfer-4').val();

        if (!password) {
            alert("no wif")
            return;
        }
        if (!asset) {
            alert("no asset address")
            return;
        }
        if (!toAddress) {
            alert("no destination address")
            return;
        }
        if (!amount) {
            alert("no amount")
            return;
        }
        if (!fee) {
            alert("no fee")
            return;
        }
        callRPC("transfer", [password, asset, toAddress, Number(amount), Number(fee)]);
    });

    // history
    $("body").on('click', '#fn-history', function () {
        var wallet_address = $('#pm-history-0').val();
        if (!wallet_address) {
            alert("no wallet address")
            return;
        }

        var limit = $('#pm-history-1').val();
        var page = $('#pm-history-2').val();

        if (limit && page) {
            callRPC("getalltransactions", [wallet_address, limit, page]);
            return;
        }

        if (limit) {
            callRPC("getalltransactions", [wallet_address, limit]);
            return;
        }

        if (page) {
            callRPC("getalltransactions", [wallet_address, 1, page]);
            return;
        }
        callRPC("getalltransactions", [wallet_address]);
    });

    // token
    $("body").on('click', '#fn-token', function () {
        var token = $('#pm-token').val()
        if (!token) {
            alert("no token")
            return;
        }
        callRPC("nep5info", [token]);
    });

    // token balance
    $("body").on('click', '#fn-token-balance', function () {
        var address = $('#pm-token-balance-1').val();
        if (!address) {
            alert("no address")
            return;
        }
        callRPC("getnep5balances", [address]);
    });

    // token transfer
    $("body").on('click', '#fn-token-transfer', function () {
        dispLoading("Loading...");
        var fromAddress = $('#pm-token-transfer-1').val();
        var toAddress = $('#pm-token-transfer-2').val();
        var tokenAddress = $('#pm-token-transfer-3').val();
        var amount = $('#pm-token-transfer-4').val();
        var password = $('#pm-token-transfer-5').val();
        if (!fromAddress) return;
        if (!toAddress) return;
        if (!tokenAddress) return;
        if (!amount) return;
        if (!password) return;
        var url = '/token/transfer';
        var data = {};
        data.fromAddress = fromAddress;
        data.toAddress = toAddress;
        data.tokenAddress = tokenAddress;
        data.amount = amount;
        data.password = password;

        $.ajax({
            headers: { 'x-access-token': token },
            url: $('#pm-node').val(),
            type: 'POST',
            data: data
        })
            .done((data) => { $('#result').text(data); })
            .fail((error) => { $('#result').text(error); })
            .always((data) => { removeLoading(); });
    });

    // token history
    $("body").on('click', '#fn-token-history', function () {
        var address = $('#pm-token-history-1').val();
        if (!address) {
            alert("no address")
            return;
        }
        callRPC("getnep5transfers", [address]);
    });
});

function callRPC(method, params) {
    dispLoading("Loading...");
    $.ajax({
        contentType: 'application/json; charset=utf-8',
        traditional: true,
        url: $('#pm-node').val(),
        type: 'POST',
        data: JSON.stringify({
            "jsonrpc": "2.0",
            "method": method,
            "params": params,
            "id": 1
        }),
    })
        .done((data) => { $('#result').html(syntaxHighlight(JSON.stringify(data, undefined, 4))); })
        .fail((error) => { $('#result').html(syntaxHighlight(JSON.stringify(error, undefined, 4))); })
        .always((data) => { removeLoading(); });
}

function dispLoading(msg) {
    if (msg == undefined) {
        msg = "";
    }
    var dispMsg = "<div class='loadingMsg'>" + msg + "</div>";
    if ($("#loading").length == 0) {
        $("body").append("<div id='loading'>" + dispMsg + "</div>");
    }
}

function removeLoading() {
    $("#loading").remove();
}

function syntaxHighlight(json) {
    json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
        var cls = 'number';
        if (/^"/.test(match)) {
            if (/:$/.test(match)) {
                cls = 'key';
            } else {
                cls = 'string';
            }
        } else if (/true|false/.test(match)) {
            cls = 'boolean';
        } else if (/null/.test(match)) {
            cls = 'null';
        }
        return '<span class="' + cls + '">' + match + '</span>';
    });
}
