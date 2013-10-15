var CallBar = function (options) {
  var spec = options || {};
  this.states = {
    incoming: {
      buttons: [
        {
          cls: 'answer',
          label: 'Answer'
        },
        {
          cls: 'ignore',
          label: 'Ignore'
        }
      ]
    },
    calling: {
      buttons: [{
        cls: 'cancel',
        label: 'Cancel'
      }]
    },
    active: {
      buttons: [{
        cls: 'end',
        label: 'End Call'
      }],
      timer: true
    },
    inactive: {
      buttons: [],
      clearUser: true,
      hidden: true
    },
    ending: {
      buttons: []
    },
    waiting: {
      buttons: []
    }
  };

  this.config = {
    defaultName: '',
    defaultNumber: 'Unknown Number'
  };
};

CallBar.prototype.render = function () {
  if (!this.dom) {
    this.dom = this.domify(template(this));
    this.addButtonHandlers();
    document.body.insertBefore(this.dom, document.body.firstChild);
  } else {
    this.dom.innerHTML = this.domify(template(this)).innerHTML;
  }
  this.setState('inactive');
  return this.dom;
};

CallBar.prototype.addButtonHandlers = function () {
  var self = this;
  this.dom.addEventListener('click', function (e) {
    var target = e.target;
    if (target.tagName === 'BUTTON') {
      if (self[target.className]) {
        self[target.className]();
      }
      return false;
    }
  }, true);
};

CallBar.prototype.getStates = function () {
  return Object.keys(this.states);
};

CallBar.prototype.setState = function (state) {
  if (!this.dom) return this;
  var buttons = this.dom.querySelectorAll('button'),
    callActionsEl = this.dom.querySelector('.callActions'),
    self = this,
    stateDef = this.states[state],
    forEach = Array.prototype.forEach;
  if (stateDef) {
    // set proper class on bar itself
    this.getStates().forEach(function (cls) {
      self.dom.classList.remove(cls);
    });
    self.dom.classList.add(state);

    // set/remove 'hidden' class on bar itself
    if (stateDef.hidden) {
      self.dom.classList.remove('visible');
      document.body.classList.remove('candybarVisible');
    } else {
      self.dom.classList.add('visible');
      document.body.classList.add('candybarVisible');
    }

    // remove all the buttons
    forEach.call(buttons, function (button) {
      button.parentElement.removeChild(button);
    });

    // add buttons
    stateDef.buttons.forEach(function (button) {
      callActionsEl.appendChild(self.domify('<button class="' + button.cls + '">' + button.label + '</button>'));
    });

    // start/stop timer
    if (stateDef.timer) {
      if (this.timerStopped) {
        this.startTimer();
      }
    } else {
      this.resetTimer();
    }

    // reset user if relevant
    if (stateDef.clearUser) {
      this.clearUser();
    }

  } else {
    throw new Error('Invalid value for CallBar state. Valid values are: ' + this.getStates().join(', '));
  }
  return this;
};

CallBar.prototype.endGently = function (delay) {
  var self = this;
  this.setState('ending');
  setTimeout(function () {
    self.dom.classList.remove('visible');
    setTimeout(function () {
      self.setState('inactive');
      self.clearUser();
    }, 1000);
  }, 1000);
  return this;
};

CallBar.prototype.setImageUrl = function (url) {
  this.attachImageDom(!!url);
  this.imageDom.src = url;
  this.dom.classList[!!url ? 'add' : 'remove']('havatar');
};

CallBar.prototype.attachImageDom = function (bool) {
  if (!this.imageDom) {
    this.imageDom = this.dom.querySelector('.callerAvatar');
  }
  if (bool && !this.imageDom.parentElement) {
    this.dom.insertBefore(this.imageDom, this.dom.firstChild);
  } else if (this.imageDom.parentElement) {
    this.imageDom.parentElement.removeChild(this.imageDom);
  }
  return this.imageDom;
};

CallBar.prototype.getUser = function () {
  var user = this.user || {},
    self = this;
  return {
    picUrl: user.picUrl,
    name: (user.name && user.name) || this.config.defaultName,
    number: function () {
      if (user.number && user.number !== self.config.defaultNumber) {
        if (phoney) {
          return phoney.stringify(user.number);
        } else {
          return escape(user.number);
        }
      } else {
        return self.config.defaultNumber;
      }
    }()
  };
};

CallBar.prototype.setUser = function (details) {
  this.user = details;
  if (!this.dom) return;
  var user = this.getUser();
  this.dom.querySelector('.callerNumber').innerHTML = user.number;
  this.dom.querySelector('.callerName').innerHTML = user.name;
  this.setImageUrl(user.picUrl);
  return this;
};

CallBar.prototype.clearUser = function () {
  this.setUser({
    picUrl: '',
    name: '',
    number: ''
  });
  return this;
};

CallBar.prototype.domify = function (str) {
  var div = document.createElement('div');
  div.innerHTML = str;
  return div.firstElementChild;
};

CallBar.prototype.startTimer = function () {
  this.timerStartTime = Date.now();
  this.timerStopped = false;
  this.updateTimer();
  return this;
};

CallBar.prototype.stopTimer = function () {
  this.timerStopped = true;
  return this;
};

CallBar.prototype.resetTimer = function () {
  this.timerStopped = true;
  this.setTimeInDom('0:00:00');
  return this;
};

CallBar.prototype.updateTimer = function () {
  if (this.timerStopped) return;

  var diff = Date.now() - this.timerStartTime,
      s = Math.floor(diff / 1000) % 60,
      min = Math.floor((diff / 1000) / 60) % 60,
      hr = Math.floor(((diff / 1000) / 60) / 60) % 60,
      time = [hr, this.zeroPad(min), this.zeroPad(s)].join(':');

  if (this.time !== time) {
      this.time = time;
      this.setTimeInDom(time);
  }

  setTimeout(this.updateTimer.bind(this), 100);
};

CallBar.prototype.setTimeInDom = function (timeString) {
  if (!this.dom) return;
  this.dom.querySelector('.callTime').innerHTML = timeString;
};

CallBar.prototype.zeroPad = function (num) {
  return ((num + '').length === 1) ? '0' + num : num;
};
