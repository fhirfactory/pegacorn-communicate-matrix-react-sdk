/**
 * returns value from inner key name - obj({key1: value3}) assuming you are passing in value3 as key
 * A utility function of object type which iterates through and gets inner value that
 * matches with inner key and makes
 * an array at the end. This is quite useful for altering keypair values in object where
 * a key string name is unknown but expected output comes form value part of keypair and
 * if value contains nested keyvalue pair again then that would become cumbersome task
 * so this utility is handy to alter an object , iterate through then get value from
 * nested strings
 * https://stackoverflow.com/questions/8085004/iterate-through-nested-javascript-objects
 * example of object this function will cover:
    Original value : Obj: {
        key1: {
            key2: value1,
            key3: value2,
            key4: value3
        },
        key2: {
            key5: value4
        }
    }
* @param obj An object that contains nested keypair values as specified in above example object
* @param queryKey The key that needs to be either of {k2,k3,k4 in param}
*
**/

export function getKeyPairFromComplexObject(obj: Object, queryKey) {
    if (obj === undefined || obj === null) {
        return obj;
    }
    let name;
    let description;
    let newObj;
    Object.keys(obj).forEach(key => {
        if (typeof obj[key] === 'object') {
            let innerValue = obj[key];
            name = key;
            description = innerValue[queryKey];
            //   console.log(`new key: ${name}, new value: ${description}`);
        }
        newObj = new Object({
            'name': name,
            'description': description
        });
    })
    return newObj;
}
