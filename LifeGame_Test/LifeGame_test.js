describe('init', function() {
	it('should be a function', function() {
		assert.isFunction(init);
	});
	it('should have enough cells', function() {
		init();
		var total = $("#gamebox").children().length;
		assert.equal(total, GameSet.row * GameSet.line);  
	});
	it('should not have living cells', function() {
		var living = 0;
		for(var i = 0; i <= GameSet.row; i++)
			for(var j = 0; j <= GameSet.line; j++)
				living += cells[i][j];
		assert.equal(living, 0);
	});
});

describe('initcell', function() {
	it('should not be effective when "init" failed', function() {
		init();
		GameSet.state = "失败";
		initcell();
		var living = 0;
		for(var i = 0; i <= GameSet.row; i++)
			for(var j = 0; j <= GameSet.line; j++)
				living += cells[i][j];
		assert.equal(living, 0);
	});
	it('should have enough living cells', function() {
		init();
		initcell();
		var living = 0;
		for(var i = 0; i <= GameSet.row; i++)
			for(var j = 0; j <= GameSet.line; j++)
				living += cells[i][j];
		assert.equal(living, GameSet.living);
	});
	it('should not create living cells while the number of required living cells is too much', function() {
		GameSet.living = GameSet.total;
		initcell();
		var living = 0;
		for(var i = 0; i <= GameSet.row; i++)
			for(var j = 0; j <= GameSet.line; j++)
				living += cells[i][j];
		assert.equal(living, 0);
	});
});

describe('getid', function() {
	it('should return string while has two integer arguments', function() {
		var str = getid(3, 12);
		assert.strictEqual(typeof str, "string");
	});
	it('should return an array while it has a string argument', function() {
		var pos = getid('0203');
		assert.deepEqual(pos, [2, 3]);
	});
	it('should return 0 while it has no argument or has more than three arguments', function() {
		assert.equal(getid(0, 3, 4), 0);
	});
});

describe('clear', function() {
	it('should set all div blocks to black', function() {
		init();
		initcell();
		clear();
		var living = 0, cellid;
		for(var i = 1; i <= GameSet.row; i++)
			for(var j = 1; j <= GameSet.line; j++) {
				cellid = getid(i, j);
				if($("#" + cellid).css("backgroundColor") != "rgb(0, 0, 0)")
					living++;
			}
		assert.equal(living, 0);
	});
});

describe('cellschange', function() {
	it('should return -1 while the game state is "failure"', function() {
		GameSet.state = "失败";
		assert.equal(cellschange(), -1);
	});
	it('should return 0 while there has no living cell', function() {
		init();
		GameSet.living = 0;
		assert.equal(cellschange(), 0);
	});
	it('should return 1 while there has some living cells', function() {
		init();
		initcell();
		cellschange();
		if(GameSet.living > 0)
			assert.equal(cellschange(), 1);
	});
});