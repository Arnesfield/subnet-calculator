# subnet-calculator
A simple subnet calculator through JavaScript console.

## Usage
Open the console and enter `N.help()`. You will be prompted with the following:

```javascript
// create a network
var n = new Network("192.168.1.0 /24")

// subnet
n.subnet(10)

// vlsm
n.vlsm(20, 50, 2)

// show methods
n.show()

// show subnet information
n.sub[0].first()
n.sub[0].last()
n.sub[0].broadcast()
n.sub[0].nth(6)

// helper methods
N.calc(ip: string, n: number)
N.props(host: number)
N.help()
```