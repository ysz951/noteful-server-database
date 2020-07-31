const validateName = (Name) => {
    const name = Name.trim().split(/[ ]+/).filter(Boolean).join(' ');
    const isAlpha = function(ch){
        return /^[A-Za-z]{1,1}$/.test(ch);
    }
    if (name.length === 0) {
    return "Name is required";
    } else if (name.length < 3) {
        for (let item of name){
            if (!isAlpha(item) && item !== ' '){
                return "Name must contain only letters"
            }
        }
    return "Name must be at least 3 characters long";
    }
    for (let item of name){
        if (!isAlpha(item) && item !== ' '){
            return "Name must only contain letters"
        }
    }
}

module.exports = validateName;