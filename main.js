var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
// contains static methods
var N = (function () {
    function N() {
    }
    // class
    N.strToNumIp = function (ip) {
        var n = [];
        ip.trim().split('.').forEach(function (e) { n.push(Number(e)); });
        return n;
    };
    N.calc = function (ip, n) {
        var next = N.strToNumIp(ip);
        next[3] += Math.round(n);
        do {
            for (var i = 3; i > 0; i--) {
                if (next[i] >= 256) {
                    next[i] -= 256;
                    next[i - 1] += 1;
                }
                else if (next[i] < 0) {
                    next[i] += 256;
                    next[i - 1] -= 1;
                }
            }
        } while (next.filter(function (e) { return e >= 256 || e < 0; }).length && !(next[0] > 255 || next[0] < 0));
        // if invalid
        if (next.filter(function (e) { return e >= 256 || e < 0; }).length) {
            console.error('Result IP address is an invalid IP address.');
            return ip;
        }
        return next.join('.');
    };
    N.props = function (host) {
        var exp = 1;
        while (Math.pow(2, exp) < host + 2)
            exp++;
        return {
            exp: exp,
            host: Math.pow(2, exp) - 2,
            slash: 32 - exp
        };
    };
    N.help = function () {
        console.log('' +
            '// create a network' + '\n' +
            'var n = new Network("192.168.1.0 /24")' + '\n\n' +
            '// subnet' + '\n' +
            'n.subnet(10)' + '\n\n' +
            '// vlsm' + '\n' +
            'n.vlsm(20, 50, 2)' + '\n\n' +
            '// show methods' + '\n' +
            'n.show()' + '\n\n' +
            '// show subnet information' + '\n' +
            'n.sub[0].first()' + '\n' +
            'n.sub[0].last()' + '\n' +
            'n.sub[0].broadcast()' + '\n' +
            'n.sub[0].nth(6)' + '\n\n' +
            '// helper methods' + '\n' +
            'N.calc(ip: string, n: number)' + '\n' +
            'N.props(host: number)' + '\n' +
            'N.help()' +
            '');
    };
    return N;
}());
var IPAddress = (function () {
    function IPAddress(ip) {
        this.ip = ip;
    }
    return IPAddress;
}());
var Network = (function (_super) {
    __extends(Network, _super);
    function Network(ip) {
        var _this = _super.call(this, ip) || this;
        _this.init();
        return _this;
    }
    // class
    Network.verifyHosts = function (hosts, capacity) {
        hosts = hosts.filter(function (e) { return e > 0; });
        // verify
        var total = 0;
        hosts.forEach(function (e) { total += e + 2; });
        if (total - 2 > capacity) {
            console.error('Number of hosts exceeds network capacity.');
            return false;
        }
        return true;
    };
    Network.prototype.initSub = function (hosts) {
        var _this = this;
        // if invalid
        if (!Network.verifyHosts(hosts, this.capacity))
            return this;
        hosts = hosts.sort(function (a, b) { return (b - a); });
        // assign subnetworks
        this.sub = [];
        hosts.forEach(function (e, i) {
            var props = N.props(e);
            if (props.host == 0)
                return;
            if (_this.sub.length) {
                var sn = _this.sub[i - 1];
                _this.sub.push(new Subnetwork(i, N.calc(sn.ip, sn.avlHost + 2), e));
            }
            else
                _this.sub.push(new Subnetwork(i, _this.ip, e));
        });
        return this;
    };
    Network.prototype.init = function () {
        var temp = this.ip.replace(/ /g, '').split('/');
        this.slash = Number(temp[1]);
        this.capacity = Math.pow(256, 4 - (this.slash / 8)) - 2;
        this.ip = temp[0];
    };
    Network.prototype.vlsm = function () {
        var hosts = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            hosts[_i] = arguments[_i];
        }
        return this.initSub(hosts);
    };
    Network.prototype.subnet = function (n) {
        var props = N.props(Math.round(n));
        var nSlash = props.exp + this.slash;
        var exp = 32 - nSlash;
        var host = Math.pow(2, exp) - 2;
        var hosts = [];
        for (var i = 0; i < props.host + 2; i++)
            hosts.push(host);
        return this.initSub(hosts);
    };
    Network.prototype.show = function () {
        this.sub.forEach(function (e) { console.log(e); });
    };
    return Network;
}(IPAddress));
// subnetwork
var Subnetwork = (function (_super) {
    __extends(Subnetwork, _super);
    function Subnetwork(id, ip, host) {
        var _this = _super.call(this, ip) || this;
        var props = N.props(host);
        _this.id = id;
        _this.avlHost = props.host;
        _this.slash = props.slash;
        _this.reqHost = host;
        _this.exp = props.exp;
        return _this;
    }
    // methods
    Subnetwork.prototype.first = function () {
        return this.nth(1);
    };
    Subnetwork.prototype.last = function () {
        return this.nth(this.avlHost);
    };
    Subnetwork.prototype.broadcast = function () {
        return this.nth(this.avlHost + 1);
    };
    Subnetwork.prototype.nth = function (nth) {
        nth = nth ? Math.round(nth) : 0;
        if (this.avlHost + 2 <= nth) {
            console.error('nth host exceeds networks available hosts.');
            return undefined;
        }
        else if (nth < 0) {
            console.error('nth cannot be negative.');
            return undefined;
        }
        return N.calc(this.ip, nth);
    };
    return Subnetwork;
}(IPAddress));
// intro
console.log('Subnet Calculator. 2017.');
