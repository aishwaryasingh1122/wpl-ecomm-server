const compression = (text) => {
  const counts = [];

  if (text.length == 1) return text;

  let prev = text[0];

  let group= {
    c: text[0],
    count: 1,
  },
  for (let i = 1; i < text.length(); i++) {
    if (text.charAt(i) === prev) {
        group.count ++
    } else {
        counts.push(group)
        prev = text.charAt(i)
        group = {
            c: text.charAt(i),
            count: 1
        }
    }
  }

  counts.push(group)

  const compressedText = "";
  counts.forEach((group) => {
    if (value > 1) {
      compressedText += `${group.c}${group.count}`;
    } else {
      compressedText += `${group.c}`;
    }
  });

  return compressedText;
};

console.log(compression("aabcddee"));
