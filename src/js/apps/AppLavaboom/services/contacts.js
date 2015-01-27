angular.module(primaryApplicationName).service('contacts', function($q, $rootScope, co, user, crypto, apiProxy) {
	var self = this;

	var Contact = function(opt) {		
		this.id = opt.id;
		this.name = opt.name;		
		this.sec = opt.isSecured ? 1 : 0;
		this.dateCreated = opt.dateCreated;
		this.dateModified = opt.dateModified;
		this.data = opt.data;
	};

	var createContactEnvelope = (name, contact) => co(function *() {
		var envelope = yield crypto.encodeEnvelopeWithKeys({
			data: contact,
			encoding: 'json'
		}, [user.key.key], 'data');
		envelope.name = name;

		return envelope;
	});

	this.list = () => co(function *() {
		var contacts = (yield apiProxy(['contacts', 'list'])).body.contacts;
		return contacts
			? co.map(contacts, function *(contactEnvelope) {
				var data;

				try {
					data = yield crypto.decodeEnvelope(contactEnvelope, 'data');
				} catch (error) {
					console.error(error);
					data = null;
				}

				switch (data.majorVersion) {
					default:
						return new Contact({							
							id: contactEnvelope.id,
							name: contactEnvelope.name,
							isSecured: true,
							dateCreated: contactEnvelope.date_created,
							dateModified: contactEnvelope.date_modified,
							data: data.data,
						});
				}
			})
			: [];
	});

	this.createContact = (contact) => co(function *() {
		var envelope = yield createContactEnvelope(contact.name, contact.data);
		return yield apiProxy(['contacts', 'create'], envelope);
	});

	this.updateContact = (contact) => co(function *() {
		var envelope = yield createContactEnvelope(contact.name, contact.data);
		return yield apiProxy(['contacts', 'update'], contact.id, envelope);
	});

	this.deleteContact = (contact) => co(function *() {
		return yield apiProxy(['contacts', 'delete'], contact.id);
	});

	$rootScope.$on('initialization-completed', () => {
		co(function*(){
			var contacts = yield self.list();
			console.log('contacts: ', contacts);
			yield contacts.map(c => self.deleteContact(c));

			var testContacts = [
				new Contact({name: 'Ned Stark', data: {email: 'ned@lavaboom.com', phone: '123-456-7890', url: 'www.google.com', notes: 'Winter is coming.'}, isSecured: true}),
				new Contact({name: 'Theon Greyjoy', data: {email: 'tgreyjoy@lavaboom.com', phone: '123-456-7890', url: 'www.google.com', notes: 'Reluctant to pay iron price.'}, isSecured: true}),
				new Contact({name: 'Samwell Tarly', data: {email: 'starly@castleblack.com', phone: '123-456-7890', url: 'www.google.com', notes: 'Loyal brother of the watch.'}}),
				new Contact({name: 'Jon Snow', data: {email: 'jsnow@castleblack.com', phone: '123-456-7890', url: 'www.google.com', notes: 'Knows nothing.'}}),
				new Contact({name: 'Arya Stark', data: {email: 'waterdancer@winterfell.com', phone: '123-456-7890', url: 'www.google.com', notes: 'Has a list of names.'}}),
				new Contact({name: 'Jora Mormont', data: {email: 'khaleesifan100@gmail.com', phone: '123-456-7890', url: 'www.google.com', notes: 'Lost in the friend-zone.'}}),
				new Contact({name: 'Tyrion Lannister', data: {email: 'tyrion@lannister.com', phone: '123-456-7890', url: 'www.google.com', notes: 'Currently drunk.'}}),
				new Contact({name: 'Stannis Baratheon', data: {email: 'onetrueking@lavaboom.com', phone: '123-456-7890', url: 'www.google.com', notes: 'Nobody expects the Stannish inquisition.'}, isSecured: true}),
				new Contact({name: 'Hodor', data: {email: 'hodor@hodor.com', phone: '123-456-7890', url: 'www.google.com', notes: 'Hodor? Hodor... Hodor!'}}),
				new Contact({name: 'Margaery Tyrell', data: {email: 'mtyrell@lavaboom.com', phone: '123-456-7890', url: 'www.google.com', notes: 'Keeper of kings.'}, isSecured: true}),
				new Contact({name: 'Brienne of Tarth', data: {email: 'oathkeeper@gmail.com', phone: '123-456-7890', url: 'www.google.com', notes: 'Do not cross her.'}}),
				new Contact({name: 'Petyr Baelish', data: {email: 'petyr@lavaboom.com', phone: '123-456-7890', url: 'www.google.com', notes: 'Do not trust anyone.'}, isSecured: true})
			];
			yield testContacts.map(c => self.createContact(c));

			self.people = yield self.list();
			$rootScope.$broadcast('contacts-changed', self.people);
		});
	});

	this.people = [];

	this.getContactByEmail = (email) => {
		for(let c of self.people)
			if (c.email == email)
				return c;
		return {};
	};

	this.myself = null;

	$rootScope.$bind('user-authenticated', () => {
		self.myself = new Contact({
			name: user.name,
			email: user.email,
			isSecured: true
		});
		self.people.push(self.myself);
		$rootScope.$broadcast('contacts-changed', self.people);
	});
});