const chai = require('chai');
const chaiHttp = require('chai-http');

const {app, runServer, closeServer} = require('../server');

const should = chai.should();

chai.use(chaiHttp);

describe('Recipes', function() {
	before(function() {
		return runServer();
	});

	after(function() {
		return closeServer();
	});

	it ('should list items on GET', function() {
		return chai.request(app)
			.get('/recipes')
			.then(function(res) {
				res.should.have.status(200);
				res.should.be.json;
        res.body.should.be.a('array');

        res.body.length.should.be.at.least(1);

        const expectedKeys = ['id', 'name', 'ingredients'];
        res.body.forEach(function(item) {
        	item.should.be.a('object');
        	item.should.include.keys(expectedKeys);
        });

			});
	});

	it('should add an item on POST', function() {
    const newItem = {name: 'Popcorn', ingredients: ['1 cup of popcorn kernals', 'pat of butter']};
    return chai.request(app)
      .post('/recipes')
      .send(newItem)
      .then(function(res) {
        res.should.have.status(201);
        res.should.be.json;
        res.body.should.be.a('object');
        res.body.should.include.keys('id', 'name', 'ingredients');
        res.body.id.should.not.be.null;
        // response should be deep equal to `newItem` from above if we assign
        // `id` to it from `res.body.id`
        res.body.should.deep.equal(Object.assign(newItem, {id: res.body.id}));
      });
  });

	it('should update recipes on PUT', function() {

    const updateData = {
      name: 'foo',
      ingredients: ['bizz', 'bang']
    };

    return chai.request(app)
      // first have to get recipes so have `id` for one we
      // want to update. Note that once we're working with databases later
      // in this course get the `id` of an existing instance from the database,
      // which will allow us to isolate the PUT logic under test from our
      // GET interface.
      .get('/recipes')
      .then(function(res) {
        updateData.id = res.body[0].id;

        return chai.request(app)
          .put(`/recipes/${updateData.id}`)
          .send(updateData)
      })
      .then(function(res) {
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.include.keys('id', 'name', 'ingredients');
        res.body.name.should.equal(updateData.name);
        res.body.id.should.equal(updateData.id);
        res.body.ingredients.should.include.members(updateData.ingredients);
      });
  });

});





