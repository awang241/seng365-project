exports.User = function(name, city, country, email) {
    this.name = name;
    this.city = city;
    this.country = country;
    this.email = email;
};

exports.FullUser = function(id, name, city, country, email, password, userToken) {
    this.userId = id;
    this.name = name;
    this.city = city;
    this.country = country;
    this.email = email;
    this.password = password;
    this.userToken = userToken;
};

exports.PetitionOverview = function(id, title, category, author, signatureCount) {
    this.petitionId = id;
    this.title = title;
    this.category = category;
    this.authorName = author;
    this.signatureCount = signatureCount;
};

exports.Petition = function(row){
    this.petitionId = row.petition_id;
    this.title = row.title;
    this.description = row.description;
    this.category = row.category;
    this.authorId = row.author_id;
    this.authorName = row.author_name;
    this.authorCity = row.city;
    this.authorCountry = row.country;
    if (row.signature_count === null) {row.signature_count = 0;}
    this.signatureCount = row.signature_count;
    this.createdDate = row.created_date;
    this.closingDate = row.closing_date;
};

exports.Category = function(id, name) {
    this.categoryId = id;
    this.name = name;
};

exports.Signature = function(id, name, city, country, date) {
    this.signatoryId = id;
    this.name = name;
    this.city = city;
    this.country = country;
    this.signedDate = date;
};