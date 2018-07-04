var url = "https://localhost:3000/";
var buffers = [
    "YWNjdWVpbDEyMzQ1Ng==",
    "YS1wcm9wb3M3ODlhYmM=",
    "bWVudGlvbnMtbGVnYWxlc2RlZmdoaQ==",
    "YS1wcm9wb3Nqa2xtbm8=",
    "Y29uZGl0aW9ucy1nZW5lcmFsZXMtZC11dGlsaXNhdGlvbnBxcnN0dQ==",
    "Y29udGFjdHZ3eHl6MQ==",
    "Y29ubmV4aW9uMjM0NTY3",
    "bW90LWRlLXBhc3NlLW91YmxpZTg5YWJjZA==",
    "cmVpbml0aWFsaXNhdGlvbi1tb3QtZGUtcGFzc2VlZmdoaWo=",
    "dmFsaWRhdGlvbmtsbW5vcA==",
    "aW5zY3JpcHRpb25xcnN0dXY=",
    "cHJvZmlsLXB1YmxpY3d4eXoxMg==",
    "cHJvZmlsLWdlbmVyYWwzNDU2Nzg=",
    "cHJvZmlsLW1vdC1kZS1wYXNzZTlhYmNkZQ==",
    "cHJvZmlsLXBob3RvZmdoaWpr",
    "cHJvZmlsLXpvbmVzLWdlb2xtbm9wcQ==",
    "cHJvZmlsLXNpdGVzcnN0dXZ3",
    "cHJvZmlsLWNyZWF0aW9ueHl6MTIz",
    "cHJvZmlsLWRldGFpbHM0NTY3ODk=",
    "cHJvZmlsLW1vZGlmaWNhdGlvbmFiY2RlZg==",
    "cHJvZmlsLXJlcG9uc2VzZ2hpamts",
    "cHJvZmlsLWNhbGVuZHJpZXJtbm9wcXI=",
    "cHJvZmlsLXN1cHByZXNzaW9uc3R1dnd4",
    "cmVjaGVyY2hlLWFubm9uY2VzLWluc3RhbGxlc3l6MTIzNA==",
    "cmVjaGVyY2hlLWFubm9uY2VzLXJlbXBsYWNhbnRzNTY3ODlh",
    "ZGV0YWlscy1yZW1wbGFjYW50YmNkZWZn",
    "ZGV0YWlscy1hbm5vbmNlc2hpamtsbQ==",
    "c2lnbmFsZXItYW5ub25jZW5vcHFycw==",
    "c2lnbmFsZXItc2l0ZXR1dnd4eQ==",
    "c2lnbmFsZXItcmVwb25zZXoxMjM0NQ==",
    "c2lnbmFsZXItbWVtYnJlNjc4OWFi",
    "Zm9yYmlkZGVuY2RlZmdo",
    "YWxyZWFkeS1sb2dnZWQtaW5pamtsbW4=",
    "YWRtaW5vcHFyc3Q=",
    "bWFpbnV2d3h5eg=="
];

var verifRequete = function(req, res, next) {
    var sessionBoolean = false;
    var authorizationBoolean = false;

    if(req.headers['x-session-token'] !== undefined && req.headers.authorization !== undefined) {
        for(var i = 0 ; i < buffers.length ; i++) {
            if(req.headers['x-session-token'] === buffers[i]) {
                sessionBoolean = true;
            }

            if(req.headers.authorization.includes(buffers[i])) {
                authorizationBoolean = true;
            }
        }

        if(req.headers.referer === url && sessionBoolean && authorizationBoolean) {
            return next();
        }

        else {
            var error = new Error('Accès refusé');
            error.status = 401;

            throw error;
        }
    }

    else {
        var error = new Error('Accès refusé');
        error.status = 401;

        throw error;
    }
};

module.exports = verifRequete;