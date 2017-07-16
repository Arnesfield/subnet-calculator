// contains static methods
class N {
  // class
  private static strToNumIp(ip: string): number[] {
    var n = [];
    ip.trim().split('.').forEach(e => { n.push(Number(e)) });
    return n;
  }

  public static calc(ip: string, n: number): string {
    var next: number[] = N.strToNumIp(ip);

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
    } while (
      next.filter(e => e >= 256 || e < 0).length && !(next[0] > 255 || next[0] < 0)
    );

    // if invalid
    if (next.filter(e => e >= 256 || e < 0).length) {
      console.error('Result IP address is an invalid IP address.');
      return ip;
    }

    return next.join('.');
  }

  public static props(host: number) {
    var exp = 1;
    while (Math.pow(2, exp) < host + 2) exp++;
    return {
      exp: exp,
      host: Math.pow(2, exp) - 2,
      slash: 32 - exp
    };
  }

  public static help(): void {
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
  }
}


class IPAddress {

  public ip: string;
  public slash: number;

  public constructor(ip: string) {
    this.ip = ip;
  }
}

class Network extends IPAddress {

  // class
  private static verifyHosts(hosts: number[], capacity: number): boolean {
    hosts = hosts.filter(e => e > 0);
    // verify
    var total = 0;
    hosts.forEach(e => { total += e + 2 });

    if (total - 2 > capacity) {
      console.error('Number of hosts exceeds network capacity.');
      return false;
    }

    return true;
  }

  // instance
  private sub: Subnetwork[];
  private capacity: number;

  public constructor(ip: string) {
    super(ip);
    this.init();
  }

  private initSub(hosts: number[]): Network {

    // if invalid
    if (!Network.verifyHosts(hosts, this.capacity))
      return this;

    hosts = hosts.sort((a, b) => (b - a));
    // assign subnetworks
    this.sub = [];
    hosts.forEach((e, i) => {
      var props = N.props(e);
      if (props.host == 0)
        return;

      if (this.sub.length) {
        var sn = this.sub[i - 1];
        this.sub.push(new Subnetwork(i, N.calc(sn.ip, sn.avlHost + 2), e));
      }
      else
        this.sub.push(new Subnetwork(i, this.ip, e));
    });

    return this;
  }

  private init(): void {
    var temp = this.ip.replace(/ /g, '').split('/');
    this.slash = Number(temp[1]);
    this.capacity = Math.pow(256, 4 - (this.slash / 8)) - 2;
    this.ip = temp[0];
  }

  public vlsm(...hosts: number[]): Network {
    return this.initSub(hosts);
  }

  public subnet(n: number): Network {
    var props = N.props(Math.round(n));
    var nSlash: number = props.exp + this.slash;
    var exp: number = 32 - nSlash;
    var host: number = Math.pow(2, exp) - 2;

    var hosts: number[] = [];
    for (var i = 0; i < props.host + 2; i++)
      hosts.push(host);

    return this.initSub(hosts);
  }

  public show(): void {
    this.sub.forEach(e => { console.log(e) });
  }
}


// subnetwork
class Subnetwork extends IPAddress {

  private id: number;
  public avlHost: number;
  private reqHost: number;
  public exp: number;

  public constructor(id: number, ip: string, host: number) {
    super(ip);
    var props = N.props(host);
    this.id = id;
    this.avlHost = props.host;
    this.slash = props.slash;
    this.reqHost = host;
    this.exp = props.exp;
  }

  // methods
  public first(): string {
    return this.nth(1);
  }

  public last(): string {
    return this.nth(this.avlHost);
  }

  public broadcast(): string {
    return this.nth(this.avlHost + 1);
  }

  public nth(nth: number): string {
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
  }
}

// intro
console.log('Subnet Calculator. 2017.');