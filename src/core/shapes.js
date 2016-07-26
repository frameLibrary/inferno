import { isUndefined } from './utils';

export const NULL_INDEX = -1;
export const ROOT_INDEX = -2;

export const NodeTypes = {
	ELEMENT: 0,
	COMPONENT: 1,
	TEMPLATE: 2,
	TEXT: 3,
	PLACEHOLDER: 4,
	FRAGMENT: 5,
	VARIABLE: 6
};

function VElement(tag) {
	this._type = NodeTypes.ELEMENT;
	this._dom = null;
	this._tag = tag;
	this._children = null;
	this._key = null;
	this._props = null;
	this._hooks = null;
}

VElement.prototype = {
	children(children) {
		this._children = children;
		return this;
	},
	key(key) {
		this._key = key;
		return this;
	},
	props(props) {
		this._props = props;
		return this;
	},
	hooks(hooks) {
		this._hooks = hooks;
		return this;
	},
	events(events) {
		this._events = events;
		return this;
	}
};

function VComponent(component) {
	this._type = NodeTypes.COMPONENT;
	this._dom = null;
	this._component = component;
	this._props = null;
	this._hooks = null;
	this._key = null;
	this._isStateful = !isUndefined(component.prototype) && !isUndefined(component.prototype.render);
}

VComponent.prototype = {
	key(key) {
		this._key = key;
		return this;
	},
	props(props) {
		this._props = props;
		return this;
	},
	hooks(hooks) {
		this._hooks = hooks;
		return this;
	}
};

export function VTemplate(templateReducers, key, v0, v1, v2) {
	this._type = NodeTypes.TEMPLATE;
	this._dom = null;
	this._tr = templateReducers;
	this._key = key;
	this._v0 = v0;
	this._v1 = v1;
	this._v2 = v2;
}

VTemplate.prototype = {
	read(index) {
		let value;
		if (index === ROOT_INDEX) {
			value = this._dom;
		} else if (index === 0) {
			value = this._v0;
		} else {
			value = this._v1[index - 1];
		}
		return value;
	},
	write(index, value) {
		if (index === ROOT_INDEX) {
			this._dom = value;
		} else if (index === 0) {
			this._v0 = value;
		} else {
			const array = this._v1;
			if (!array) {
				this._v1 = [value];
			} else {
				array[index - 1] = value;
			}
		}
	}
};

function VText(text) {
	this._type = NodeTypes.TEXT;
	this._text = text;
	this._dom = null;
}

function VPlaceholder() {
	this._type = NodeTypes.PLACEHOLDER;
	this._dom = null;
}

function VFragment(items) {
	this._type = NodeTypes.FRAGMENT;
	this._dom = null;
	this._pointer = null;
	this._items = items;
}

function Variable(arg) {
	this._type = NodeTypes.VARIABLE;
	this._arg = arg;
}

function TemplaceReducers(keyIndex, mount, patch, unmount) {
	this._keyIndex = keyIndex;
	this._schema = null;
	this.mount = mount;
	this.patch = patch;
	this.unmount = unmount;
}

export function createVTemplate(schema, renderer) {
	const argCount = schema.length;
	const parameters = [];

	for (let i = 0; i < argCount; i++) {
		parameters.push(new Variable(i));
	}
	const vNode = schema(...parameters);
	const templateReducers = renderer.createTemplateReducers(vNode, true, { length: argCount }, null, false);
	const keyIndex = templateReducers._keyIndex;

	templateReducers._schema = schema;
	switch (argCount) {
		case 0:
			return () => new VTemplate(templateReducers, null, null, null);
		case 1:
			if (keyIndex === 0) {
				return v0 => new VTemplate(templateReducers, v0, v0, null);
			} else {
				return v0 => new VTemplate(templateReducers, null, v0, null);
			}
		default:
			if (keyIndex === NULL_INDEX) {
				return (v0, ...v1) => new VTemplate(templateReducers, null, v0, v1);
			} else if (keyIndex === 0) {
				return (v0, ...v1) => new VTemplate(templateReducers, v0, v0, v1);
			} else {
				return (v0, ...v1) => {
					return new VTemplate(templateReducers, v1[keyIndex - 1], v0, v1);
				};
			}
	}
}

export function createTemplaceReducers(keyIndex, mount, patch, unmount) {
	return new TemplaceReducers(keyIndex, mount, unmount);
}

export function createVComponent(component) {
	return new VComponent(component);
}

export function createVElement(tag) {
	return new VElement(tag);
}

export function createVText(text) {
	return new VText(text);
}

export function createVPlaceholder() {
	return new VPlaceholder();
}

export function createVFragment(items) {
	return new VFragment(items);
}

export function isVText(o) {
	return o._type === NodeTypes.TEXT;
}

export function isVariable(o) {
	return o._type === NodeTypes.VARIABLE;
}

export function isVPlaceholder(o) {
	return o._type === NodeTypes.PLACEHOLDER;
}

export function isVFragment(o) {
	return o._type === NodeTypes.FRAGMENT;
}

export function isVElement(o) {
	return o._type === NodeTypes.ELEMENT;
}

export function isVTemplate(o) {
	return o._type === NodeTypes.TEMPLATE;
}

export function isVComponent(o) {
	return o._type === NodeTypes.COMPONENT;
}
