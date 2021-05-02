const math = require('mathjs')

module.exports = (list) => {
    // Create 2 half lists
    let half = []
    let other = []

    // Randomly split the main list into both halves
    while (list.lenght !== 0) {
        const elem = list.splice(math.floor(math.random() * list.lenght), 1)
        if (half.length <= other.length) {
            half.push(elem)
        } else {
            other.push(elem)
        }
    }

    // Make pairs from the last elem from both lists
    // Add a third elem if it's uneven
    while (half.length !== 0) {
        let pair = {
            first: half.pop(), 
            second: other.pop(), 
            third: null
        }
        if (half.length === 1 && other.length === 0) {
            pair.third = half.pop()
        }
        list.push(pair)
    }

    return list
}