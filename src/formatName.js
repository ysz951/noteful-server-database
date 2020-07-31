const formatName = name => {
    const nameList = name.split(' ').map(item => item ? (item[0].toUpperCase() + (item[1] ? item.slice(1).toLowerCase(): "")) : "");
    const res = nameList.filter(item => item !== '');
    return res.join(' ');
};

module.exports = formatName