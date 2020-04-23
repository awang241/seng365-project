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

exports.Petition = function(overview, descr, author, city, country, startDate, endDate){
    this.petitionId = overview.petitionId;
    this.title = overview.title;
    this.description = descr;
    this.category = overview.category;
    this.authorName = author;
    this.authorCity = city;
    this.authorCountry = country;
    this.signatureCount = overview.signatureCount;
    this.createdDate = startDate;
    this.closingDate = endDate;
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