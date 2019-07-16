const Assert = require('assert');
const SteamID = require('./index.js');

function start(test) {
	process.stdout.write("testing " + test + "... ");
}

function end() {
	console.log("ok");
}

function checkProperty(obj, prop, expected) {
	Assert.strictEqual(obj[prop], expected, "unexpected " + prop + " value " + obj[prop]);
}

function checkProperties(obj, expected) {
	for(var i in expected) {
		checkProperty(obj, i, expected[i]);
	}
}

try {
	var sid, val;

	start("parameterless construction");
	sid = new SteamID();
	checkProperties(sid, {
		"universe": SteamID.Universe.INVALID,
		"type": SteamID.Type.INVALID,
		"instance": SteamID.Instance.ALL,
		"accountid": 0
	});
	end();

	start("fromIndividualAccountID construction");
	sid = SteamID.fromIndividualAccountID(46143802);
	checkProperties(sid, {
		"universe": SteamID.Universe.PUBLIC,
		"type": SteamID.Type.INDIVIDUAL,
		"instance": SteamID.Instance.DESKTOP,
		"accountid": 46143802
	});
	end();

	start("fromIndividualAccountID invalid");
	sid = SteamID.fromIndividualAccountID('');
	Assert.equal(sid.isValid(), false);
	end();

	start("steam2id construction (universe 0)");
	sid = new SteamID("STEAM_0:0:23071901");
	checkProperties(sid, {
		"universe": SteamID.Universe.PUBLIC,
		"type": SteamID.Type.INDIVIDUAL,
		"instance": SteamID.Instance.DESKTOP,
		"accountid": 46143802
	});
	end();

	start("steam2id construction (universe 1)");
	sid = new SteamID("STEAM_1:1:23071901");
	checkProperties(sid, {
		"universe": SteamID.Universe.PUBLIC,
		"type": SteamID.Type.INDIVIDUAL,
		"instance": SteamID.Instance.DESKTOP,
		"accountid": 46143803
	});
	end();

	start("steam3id construction (individual)");
	sid = new SteamID("[U:1:46143802]");
	checkProperties(sid, {
		"universe": SteamID.Universe.PUBLIC,
		"type": SteamID.Type.INDIVIDUAL,
		"instance": SteamID.Instance.DESKTOP,
		"accountid": 46143802
	});
	end();

	start("steam3id construction (gameserver)");
	sid = new SteamID("[G:1:31]");
	checkProperties(sid, {
		"universe": SteamID.Universe.PUBLIC,
		"type": SteamID.Type.GAMESERVER,
		"instance": SteamID.Instance.ALL,
		"accountid": 31
	});
	end();

	start("steam3id construction (anon gameserver)");
	sid = new SteamID("[A:1:46124:11245]");
	checkProperties(sid, {
		"universe": SteamID.Universe.PUBLIC,
		"type": SteamID.Type.ANON_GAMESERVER,
		"instance": 11245,
		"accountid": 46124
	});
	end();

	start("steam3id construction (lobby)");
	sid = new SteamID("[L:1:12345]");
	checkProperties(sid, {
		"universe": SteamID.Universe.PUBLIC,
		"type": SteamID.Type.CHAT,
		"instance": SteamID.ChatInstanceFlags.Lobby,
		"accountid": 12345
	});
	end();

	start("steam3id construction (lobby with instanceid)");
	sid = new SteamID("[L:1:12345:55]");
	checkProperties(sid, {
		"universe": SteamID.Universe.PUBLIC,
		"type": SteamID.Type.CHAT,
		"instance": SteamID.ChatInstanceFlags.Lobby | 55,
		"accountid": 12345
	});
	end();

	start("steamid64 construction (individual)");
	sid = new SteamID("76561198006409530");
	checkProperties(sid, {
		"universe": SteamID.Universe.PUBLIC,
		"type": SteamID.Type.INDIVIDUAL,
		"instance": SteamID.Instance.DESKTOP,
		"accountid": 46143802
	});
	end();

	start("steamid64 construction (clan)");
	sid = new SteamID("103582791434202956");
	checkProperties(sid, {
		"universe": SteamID.Universe.PUBLIC,
		"type": SteamID.Type.CLAN,
		"instance": SteamID.Instance.ALL,
		"accountid": 4681548
	});
	end();

	start("invalid construction");
	Assert.throws(function() {
		new SteamID("invalid input");
	}, Error, "expected invalid input to throw Error");
	end();

	start("steam2id rendering (universe 0)");
	sid = new SteamID();
	sid.universe = SteamID.Universe.PUBLIC;
	sid.type = SteamID.Type.INDIVIDUAL;
	sid.instance = SteamID.Instance.DESKTOP;
	sid.accountid = 46143802;
	val = sid.getSteam2RenderedID();
	Assert.strictEqual(val, "STEAM_0:0:23071901", "unexpected rendered steam2id value " + val);
	end();

	start("steam2id rendering (universe 1)");
	sid = new SteamID();
	sid.universe = SteamID.Universe.PUBLIC;
	sid.type = SteamID.Type.INDIVIDUAL;
	sid.instance = SteamID.Instance.DESKTOP;
	sid.accountid = 46143802;
	val = sid.getSteam2RenderedID(true);
	Assert.strictEqual(val, "STEAM_1:0:23071901", "unexpected rendered steam2id value " + val);
	end();

	start("steam2id rendering (shorthand)");
	sid = new SteamID();
	sid.universe = SteamID.Universe.PUBLIC;
	sid.type = SteamID.Type.INDIVIDUAL;
	sid.instance = SteamID.Instance.DESKTOP;
	sid.accountid = 46143802;
	val = sid.steam2();
	Assert.strictEqual(val, "STEAM_0:0:23071901", "unexpected rendered steam2id value " + val);
	end();

	start("steam2id rendering (non-individual)");
	sid = new SteamID();
	sid.universe = SteamID.Universe.PUBLIC;
	sid.type = SteamID.Type.CLAN;
	sid.instance = SteamID.Instance.DESKTOP;
	sid.accountid = 4681548;
	Assert.throws(sid.getSteam2RenderedID.bind(sid), Error, "expected error for rendered steam2id for non-individual type");
	end();

	start("steam3id rendering (individual)");
	sid = new SteamID();
	sid.universe = SteamID.Universe.PUBLIC;
	sid.type = SteamID.Type.INDIVIDUAL;
	sid.instance = SteamID.Instance.DESKTOP;
	sid.accountid = 46143802;
	val = sid.getSteam3RenderedID();
	Assert.strictEqual(val, "[U:1:46143802]", "unexpected rendered steam3id value " + val);
	end();

	start("steam3id rendering (shorthand)");
	sid = new SteamID();
	sid.universe = SteamID.Universe.PUBLIC;
	sid.type = SteamID.Type.INDIVIDUAL;
	sid.instance = SteamID.Instance.DESKTOP;
	sid.accountid = 46143802;
	val = sid.steam3();
	Assert.strictEqual(val, "[U:1:46143802]", "unexpected rendered steam3id value " + val);
	end();

	start("steam3id rendering (anon gameserver)");
	sid = new SteamID();
	sid.universe = SteamID.Universe.PUBLIC;
	sid.type = SteamID.Type.ANON_GAMESERVER;
	sid.instance = 41511;
	sid.accountid = 43253156;
	val = sid.getSteam3RenderedID();
	Assert.strictEqual(val, "[A:1:43253156:41511]", "unexpected rendered steam3id value " + val);
	end();

	start("steam3id rendering (lobby)");
	sid = new SteamID();
	sid.universe = SteamID.Universe.PUBLIC;
	sid.type = SteamID.Type.CHAT;
	sid.instance = SteamID.ChatInstanceFlags.Lobby;
	sid.accountid = 451932;
	val = sid.getSteam3RenderedID();
	Assert.strictEqual(val, "[L:1:451932]");
	end();

	start("steamid64 rendering (individual)");
	sid = new SteamID();
	sid.universe = SteamID.Universe.PUBLIC;
	sid.type = SteamID.Type.INDIVIDUAL;
	sid.instance = SteamID.Instance.DESKTOP;
	sid.accountid = 46143802;
	val = sid.getSteamID64();
	Assert.strictEqual(val, "76561198006409530", "unexpected rendered steamid64 value " + val);
	end();

	start("steamid64 rendering (anon gameserver)");
	sid = new SteamID();
	sid.universe = SteamID.Universe.PUBLIC;
	sid.type = SteamID.Type.ANON_GAMESERVER;
	sid.instance = 188991;
	sid.accountid = 42135013;
	val = sid.getSteamID64();
	Assert.strictEqual(val, "90883702753783269", "unexpected rendered steamid64 value " + val);
	end();

	start("invalid new id");
	sid = new SteamID();
	Assert.equal(sid.isValid(), false, "expected new id to be invalid");
	end();

	start("invalid individual instance");
	sid = new SteamID("[U:1:46143802:10]");
	Assert.equal(sid.isValid(), false, "expected individual id with instance 10 to be invalid");
	end();

	start("invalid non-all clan instance");
	sid = new SteamID("[g:1:4681548:2]");
	Assert.equal(sid.isValid(), false, "expected clan id with instance 2 to be invalid");
	end();

	start("invalid gameserver id with accountid 0");
	sid = new SteamID("[G:1:0]");
	Assert.equal(sid.isValid(), false, "expected gameserver id with accountid 0 to be invalid");
	end();
} catch(e) {
	console.log("NOT OK!");
	console.log(" - " + e.message);
	process.exit(1); // Throw error
}

console.log("all tests passed!");
process.exit(0);
