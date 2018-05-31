/*
Nicholas Anna.
https://github.com/nickanna42
Initial May 2018.
Updated May 2018.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

*/
(function() {
    var BellCurve = function BellCurve() {
        if (this.constructor === BellCurve) {
            if (arguments.length == 2) {
                if (typeof arguments[0] == 'number' && typeof arguments[1] == 'number') {
                    this._avg = arguments[0];
                    this._stddev = arguments[1];
                    this._population = null;
                } else {
                    throw new TypeError('All constructor params must be numbers');
                }
            } else if (arguments.length == 3) {
                center, stddev, N
                var center = arguments[0];
                var stddev = arguments[1];
                var N = arguments[2];
                if (typeof center == 'number' && typeof stddev == 'number' && typeof N == 'number') {
                    if (N%1 == 0 && N > 0) {
                        var holder = [];
                        for (var i = 0; i < N; i++) {
                            holder.push(BellCurve.randomNumber(center, stddev));
                        }
                        return new BellCurve(holder);
                    } else {
                        throw new TypeError('N must be a positive integer');
                    }
                } else {
                    throw new TypeError('expecting all new BellCurve() params to be numbers');
                }
            } else if (arguments.length == 1) {
                if (Array.isArray(arguments[0])) {
                    arguments[0].forEach(function(currentEntry) {
                        if (typeof currentEntry != 'number') {
                            throw new TypeError('All items in population must be numbers');
                        }
                    });
                    this._population = arguments[0];
                } else {
                    throw new TypeError('population must be an array');
                }
            } else {
                throw new ReferenceError('Constructor requires 1 to 3 arguments');
            }
        } else {
            throw new SyntaxError('Must be called as a constructor');
        }
    };

    BellCurve.prototype.getAvg = function() {
        if (this._population === null) {
            return this._avg;
        } else {
            return this._population.reduce(function(total, currentValue) {return total + currentValue;}, 0) / this._population.length;
        }
    };

    BellCurve.prototype.getStdDev = function() {
        if (this._population === null) {
            return this._stddev;
        } else {
            var tempAvg = this.getAvg();
            return Math.sqrt(this._population.reduce(function(total, currentValue) {return total + (currentValue - tempAvg)**2}, 0) / this._population.length);
        }
    };

    BellCurve.prototype.getN = function() {
        if (this._population === null) {
            return undefined;
        } else {
            return this._population.length;
        }
    };

    BellCurve.prototype.getPopulation = function() {
        if (this._population === null) {
            return undefined;
        } else {
            var output = [];
            Object.assign(output, this._population);
            return output;
        }
    };

    BellCurve.prototype.setPopulation = function(newPopulation) {
        if (Array.isArray(newPopulation)) {
            var badEntry = false;
            for (var i = 0; i < newPopulation.length; i++) {
                if (typeof newPopulation[i] != 'number') {
                    badEntry = true;
                }
            }
            if (!badEntry) {
                this._population = newPopulation;
            }
        }
    };

    BellCurve.prototype.setStdDev = function(newStdDev) {
        if (this._population === null) {
            if (typeof newStdDev == 'number') {
                this._stddev = newStdDev;
            } else {
                throw new TypeError('newStdDev must be a number');
            }
        } else {
            return undefined;
        }
    };

    BellCurve.prototype.setAvg = function(newAvg) {
        if (this._population === null) {
            if (typeof newAvg == 'number') {
                this._avg = newAvg;
            } else {
                throw new TypeError('newAvg must be a number');
            }
        } else {
            return undefined;
        }
    }

    BellCurve.prototype.addMember = function(newMember) {
        if (this._population === null) {
            return undefined;
        } else if (typeof newMember != 'number') {
            throw new TypeError('newMember must be a number');
        } else {
            this._population.push(newMember);
        }
    };

    BellCurve.prototype.percentileRank = function(rawScore) {
        // returns the percentile rank of a raw score
        if (typeof rawScore == 'number') {
            var localAvg = this.getAvg();
            var localStdDev = this.getStdDev();
            var output = -0.5 * BellCurve.errorFunction((localAvg - rawScore) / (Math.SQRT2 * localStdDev)) + 0.5;
            return Math.round(output*1000) / 10;
        } else {
            throw new ReferenceError('rawScore must be a number');
        }
    };

    BellCurve.prototype.rawScore = function(percentileRank) {
        percentileRank = percentileRank / 100;
        var localAvg = this.getAvg();
        var localStdDev = this.getStdDev();
        return Math.floor(localAvg - BellCurve.inverseErrorFunction(1 - 2 * percentileRank) * Math.SQRT2 * localStdDev);
    };

    BellCurve.prototype.actualPercentileRank = function(rawScore) {
        if (typeof rawScore == 'number') {
            if (this._population === null) {
                return undefined;
            } else {
                return Math.round(
                    this._population
                    .filter(function(entry) {
                        return entry <= rawScore;
                    })
                    .length / this._population.length * 1000
                ) / 10;
            }
        } else {
            throw new TypeError('rawScore must be a number');
        }
    };

    BellCurve.prototype.actualRank = function(rawScore) {
        if (typeof rawScore == 'number') {
            if (this._population === null) {
                return undefined;
            } else {
                return this._population
                .filter(function(entry) {
                    return entry > rawScore;
                })
                .length + 1;
            }
        } else {
            throw new TypeError('rawScore must be a number');
        }
    };

    BellCurve.prototype.curveRandom = function() {
        var center = this.getAvg();
        var std_dev = this.getStdDev();
        var u = 0, v = 0;
        while (u === 0) {u = Math.random();}
        while (v === 0) {v = Math.random();}
        var bell = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
        bell = bell * std_dev + center;
        return bell;
    };

    BellCurve.prototype.actualRandom = function() {
        if (this._population === null) {
            return undefined;
        } else {
            var randIndex = Math.floor(Math.random() * this._population.length);
            return this._population[randIndex];
        }
    };

    BellCurve.randomNumber = function(center, std_dev) {
        // return a random number from a normal distribution.
        var u = 0, v = 0;
        while (u === 0) {u = Math.random();}
        while (v === 0) {v = Math.random();}
        var bell = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
        bell = bell * std_dev + center;
        return bell;
    };

    BellCurve.factorial = function(N) {
        if (typeof N == 'number') {
            if (N%1 == 0 && N >= 0) {
                var output = 1;
                if (N == 0) {
                    return output;
                } else {
                    for (var i = 1; i <= N; i++) {
                        output = output*i;
                    }
                    return output;
                }
            } else {
                throw new TypeError('N must be zero or a positive integer');
            }
        } else {
            throw new TypeError('N must be zero or a positive integer');
        }
    };

    BellCurve.errorFunction = function(x) {
        if (typeof x == 'number') {
            var output = 0;
            for (var n = 0; n < 10; n++) {
                output = output + ((-1)**n * x**(2*n + 1)) / (BellCurve.factorial(n)*(2*n + 1));
            }
            output = output * 2 / Math.sqrt(Math.PI);
            return output;
        } else {
            throw new TypeError('x must be a number');
        }
    };

    BellCurve.inverseErrorFunction = function(x) {
        if (typeof x == 'number') {
            if (x > -1 && x < 1) {
                var output = 0;

                var c = function(k) {
                    var output = 0;
                    if (k == 0) {
                        return 1;
                    } else {
                        for (var m = 0; m < k; m++) {
                            output = output + (c(m) * c(k - 1 - m)) / ((m+1) * (2*m+1));
                        }
                        return output;
                    }
                };

                for (var k = 0; k < 10; k++) {
                    output = output + (c(k) * (Math.sqrt(Math.PI) * x / 2)**(2*k + 1) / (2*k + 1));
                }
                return output;
            } else {
                throw new TypeError('x must in range: -1 < x < 1');
            }
        } else {
            throw new TypeError('x must in range: -1 < x < 1');
        }
    };

    if (typeof module != 'undefined') {
        if (typeof module.exports != 'undefined') {
            module.exports = BellCurve;
        }
    } else if (typeof window != 'undefined') {
        window.BellCurve = BellCurve;
    }
})();
