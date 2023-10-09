interface Array<T> {
    /**
     * Mulitply every element of the array by provided element. If not provided every element will be multiplied by 10.
    * @param multiplier optional parameter which is multiplied every element of the array by 
    * @return {number[]}
    */
    multiply(this: Array<number>, multiplier?: number): Array<number>;

    /**
     * Returns true if all elements match the given predicate.
    * @param predicate
    * @return {boolean}
    */
    all(this: Array<T>, predicate: (value: T) => boolean): boolean;

    /**
     * Returns true if at least one element matches the given predicate.
    * @param predicate
    * @return {boolean}
    */
    any(this: Array<T>, predicate: (value: T) => boolean): boolean;

    /**
     * Returns a Map containing the values provided by valueTransform 
     * and indexed by keySelector functions applied to elements of the given sequence.
    * @param keySelector
    * @param valueTransform
    * @return {Map<K, V>}
    */
    associateBy<K, V>(keySelector: (value: T) => K, valueTransform: (value: T) => V): Map<K, V>;

    /**
     * Returns an average value of elements in the sequence.
    * @return {number}
    */
    average(this: Array<T>): number;
    
    /**
     * Splits this sequence into several lists each not exceeding the given size 
     * and applies the given transform function to an each.
    * @param size the number of elements to take in each list, must be positive 
    * and can be greater than the number of elements in this sequence.
    * @param transform optional parameter
    * @return {Array<Array<T>> | Array<R>}
    */
    chunked<R>(this: Array<T>, size: number, transform?: (value: Array<T>) => R): Array<Array<T>> | Array<R>;
    
    /**
     * Returns a sequence containing only elements from the given sequence having distinct keys returned by the given selector function.
    * @param selector
    * @return {Array<T>}
    */
    distinctBy<K>(this: Array<T>, selector: (value: T) => K): Array<T>;
    
    /**
     * Returns a sequence containing only elements matching the given predicate.
    * @param predicate
    * @return {Array<T>}
    */
    filter_(this: Array<T>, predicate: (value: T) => boolean): Array<T>;
    
    /**
     * Returns a sequence containing only elements matching the given predicate.
    * @param predicate function that takes the index of an element 
    * and the element itself and returns the result of predicate evaluation on the element.
    * @return {Array<T>}
    */
    filterIndexed(this: Array<T>, predicate: (index: number, value: T) => boolean): Array<T>;
    
    /**
     * Returns a sequence containing all elements not matching the given predicate.
    * @param predicate 
    * @return {Array<T>}
    */
    filterNot(this: Array<T>, predicate: (value: T) => boolean): Array<T>;
    
    /**
     * Returns the first element matching the given predicate, or null if no such element was found.
    * @param predicate 
    * @return {T | null}
    */
    find_(this: Array<T>, predicate: (value: T) => boolean): T | null;
    
    /**
     * Returns the last element matching the given predicate, or null if no such element was found.
    * @param predicate 
    * @return {T | null}
    */
    findLast(this: Array<T>, predicate: (value: T) => boolean): T | null;
    
    /**
     * Returns a sequence of all elements from all sequences in this sequence.
    * @return {Array<T>}
    */
    flatten(this: Array<T>): Array<T>;
    
    /**
     * Accumulates value starting with initial value 
     * and applying operation from left to right to current accumulator value and each element.
     * @param initial
     * @param operation function that takes current accumulator value and an element, and calculates the next accumulator value.
    * @return {R}
    */
    fold<R>(this: Array<T>, initial: R, operation: (acc: R, el: T) => R): R;
    
    /**
     * Returns the first element yielding the largest value of the given function.
     * @param selector
    * @return {T}
    */
    maxBy<R>(this: Array<T>, selector: (value: T) => R): T;
    
    /**
     * Returns the first element yielding the smallest value of the given function.
     * @param selector
    * @return {T}
    */
    minBy<R>(this: Array<T>, selector: (value: T) => R): T;
    
    /**
     * Returns the number of elements matching the given predicate.
     * @param predicate
    * @return {bigint}
    */
    count(this: Array<T>, predicate: (value: T) => boolean): bigint;
    
    /**
     * Groups values returned by the valueTransform function applied to each element of the original sequence 
     * by the key returned by the given keySelector function applied to the element 
     * and returns a map where each group key is associated with a list of corresponding values.
     * @param keySelector
     * @param valueTransform optional
    * @return {Map<K, Array<V | T>>}
    */
    groupBy<K, V>(this: Array<T>, keySelector: (value: T) => K, valueTransform?: (value: T) => V): Map<K, Array<V | T>>;

}




console.log("method multiply")
Array.prototype.multiply = function (multiplier: number = 10): number[] {
    return this.map((val: number) => val * multiplier);
};
console.log([1, 2, 4, 5, 6, 7].multiply());
console.log();


console.log("method all");
Array.prototype.all = function (predicate): boolean {
    return this.map(predicate).reduce((x, y) => x + Number(y), 0) == this.length ? true : false;
    // return this.every(predicate);
};
console.log([1, 2, 4, 5, 6, 7].all((numb) => numb > 0));
console.log(["apple", "pineapple", "pear"].all((numb) => numb.length < 5));
console.log();


console.log("method any");
Array.prototype.any = function (predicate): boolean {
    return this.map(predicate).reduce((x, y) => x + Number(y), 0) > 0 ? true : false;
    // return this.every(predicate);
};
console.log([1, 2, 4, 5, 6, 7].any((numb) => numb > 0));
console.log(["apple", "pineapple", "pear"].any((numb) => numb.length < 5));
console.log(["apple", "pineapple", "pear1"].any((numb) => numb.length < 5));
console.log();


console.log("method associateBy");
Array.prototype.associateBy = function (keySelector, valueTransform) {
    const keys = this.map(keySelector);
    const values = this.map(valueTransform);
    const resultMap = new Map();

    for (let index of keys.keys()) {
        resultMap.set(keys[index], values[index]);
    }
    return resultMap;
};
console.log([1, 2, 3].associateBy((value) => value.toString(), (value) => value));
console.log();


console.log("method average")
Array.prototype.average = function () {
    return this.reduce((x, y) => x + y, 0.0) / this.length;
};
console.log([1, 2, 3, 4].average());
console.log();


console.log("method chunked");
Array.prototype.chunked = function (size, transform) {
    const groupsNumber = Math.floor(this.length / size);
    let resultList = [];
    for (let leftIdx = 0; leftIdx < groupsNumber; leftIdx++) {
        resultList.push(this.slice(leftIdx * size, (leftIdx + 1) * size));
    }
    this.length > (groupsNumber * size) ? resultList.push(this.slice((groupsNumber * size),)) : null;

    if (transform !== undefined) {
        resultList = resultList.map(transform);
    }

    return resultList;
}
console.log([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].chunked(5));
console.log([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].chunked(5, (values) => values.length));
console.log();


console.log("method distinctBy");
Array.prototype.distinctBy = function (selector) {
    const keysSet = new Set();
    const resultList = [];

    let key;
    for (const el of this) {
        key = selector(el);
        if (!keysSet.has(key)) {
            keysSet.add(key);
            resultList.push(el);
        }
    }
    return resultList;
};
console.log([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].distinctBy((value) => value % 4));
console.log();


console.log("method filter");
Array.prototype.filter_ = function (predicate) {
    const resultList = [];

    for (const el of this) {
        if (predicate(el)) {
            resultList.push(el);
        }
    }
    return resultList;
};
console.log([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].filter_((value) => (value % 3) == 0));
console.log();


console.log("method filterIndexed");
Array.prototype.filterIndexed = function (predicate) {
    const resultList = [];

    for (const [idx, el] of this.entries()) {
        if (predicate(idx, el)) {
            resultList.push(el);
        }
    }
    return resultList;
};
console.log([0, 1, 2, 3, 4, 6, 5, 7, 8, 9, 10, 12, 11].filterIndexed((index, value) => value == index));
console.log();


console.log("method filterNot");
Array.prototype.filterNot = function (predicate) {
    const resultList = [];

    for (const el of this) {
        if (!predicate(el)) {
            resultList.push(el);
        }
    }
    return resultList;
};
console.log([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].filterNot((value) => (value % 3) == 0));
console.log();


console.log("method find");
Array.prototype.find_ = function (predicate) {
    for (const el of this) {
        if (predicate(el)) {
            return el;
        }
    }
    return null;
};
console.log([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].find_((value) => (value % 3) == 0));
console.log();


console.log("method findLast");
Array.prototype.findLast = function (predicate) {
    for (let idx = this.length - 1; idx >= 0; idx--) {
        if (predicate(this[idx])) {
            return this[idx];
        }
    }
    return null;
};
console.log([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].findLast((value) => (value % 3) == 0));
console.log();


console.log("method flatten");
Array.prototype.flatten = function () {
    let resultList = this.slice();

    let idx = 0;
    while (idx < resultList.length) {
        if (resultList[idx][Symbol.iterator] != undefined) {
            resultList = resultList.slice(0, idx).concat(resultList[idx], resultList.slice(idx + 1,));
            idx--;
        }
        idx++;
    }
    return resultList;
};
console.log([1,
    [2,
        [3,
            [4,
                [5]], 6], 7], 8,
    [9, 10, 11], 12].flatten());
console.log();


console.log("method fold");
Array.prototype.fold = function (initial, operation) {
    let acc = initial;
    for (const el of this) {
        acc = operation(acc, el);
    }
    return acc;
};
console.log([1, 2, 3].fold(0, (acc, el) => acc + el));
console.log();


console.log("method maxBy");
Array.prototype.maxBy = function (selector) {
    let maxEl = this[0];
    let maxVal = selector(maxEl), currVal;

    for (const el of this) {
        currVal = selector(el);
        if (currVal > maxVal) {
            maxVal = currVal;
            maxEl = el;
        }
    }
    return maxEl;
};
console.log([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].maxBy((value) => value));
console.log();


console.log("method minBy");
Array.prototype.minBy = function (selector) {
    let minEl = this[0];
    let minVal = selector(minEl), currVal;

    for (const el of this) {
        currVal = selector(el);
        if (currVal < minVal) {
            minVal = currVal;
            minEl = el;
        }
    }
    return minEl;
};
console.log([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, -1].minBy((value) => value));
console.log();


console.log("method count");
Array.prototype.count = function (predicate) {
    let count: bigint = 0n;

    for (const el of this) {
        if (predicate(el)) {
            count++;
        }
    }
    return count;
};
console.log([
    { list: [1, 2, 3] },
    { list: [4, 5, 6] },
    { list: [7, 8, 9] },
    { list: [10, 11, 12, -1] }].count((value) => value.list.length <= 3));
console.log();


console.log("method groupBy");
Array.prototype.groupBy = function (keySelector, valueTransform = (value) => value) {
    const groupedVals = new Map();
    let key, value;
    for (const el of this) {
        key = keySelector(el);
        value = valueTransform(el);
        if (!groupedVals.has(key)) {
            groupedVals.set(key, []);
        }
        groupedVals.get(key).push(value);
    }
    return groupedVals;
};
console.log([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, -1].groupBy((value) => value % 4));
console.log([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, -1].groupBy((value) => value % 4, (value) => `(${value.toString()})`));
console.log();


