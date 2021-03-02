import Card from "@element/Card";
import Element, { Initialiser } from "@element/Element";
import Heading from "@element/Heading";
import Link from "@element/Link";
import Nav from "@element/Nav";
import Files from "@util/Files";
import { PickValue } from "@util/Objects";
import { createID, HrefFile } from "@util/Strings";
import { Class } from "@util/Type";

export interface IHasCard {
	createCard (): Card;
}

export default class Article extends Element {

	protected heading = new Heading(2)
		.appendTo(this);

	protected _header = new ArticleHeader()
		.appendTo(this);

	public constructor (title: string, link?: HrefFile) {
		super("article");
		const id = link === undefined ? createID(title) : undefined;
		new Link(link ?? `#${id!}` as const)
			.text(title)
			.appendTo(this.heading.id(id));

		this.requireScripts("article");
	}

	public header (initialiser: Initialiser<ArticleHeader>) {
		initialiser(this._header);
		return this;
	}

	public addSection (title: string, initialiser: Initialiser<ArticleSection>) {
		const section = new ArticleSection(title).appendTo(this);
		initialiser(section);
		return this;
	}

	private containsCards?: { cls: Class<IHasCard>, directory: string, sectionProperty: string };
	public setContainsCards<T extends IHasCard> (cls: Class<T>, directory: string, sectionProperty: Extract<keyof PickValue<T, string>, string>) {
		this.containsCards = { cls, directory, sectionProperty };
		return this;
	}

	public async precompile () {
		const containsCards = this.containsCards;
		if (containsCards === undefined)
			return;

		const sections: Record<string, ArticleSection | undefined> = {};
		for (const { instance } of await Files.discoverClasses(containsCards.cls, containsCards.directory)) {
			const property = (instance as any as Record<string, string>)[containsCards.sectionProperty];
			let section = sections[property];
			if (section === undefined)
				this.addSection(property, s => sections[property] = section = s);

			section!.append(instance.createCard());
		}
	}
}

export class ArticleHeader extends Element {

	protected nav?: Nav;

	public constructor () {
		super("header");
		this.setOnlyRenderWithContent();
	}

	public setNav (initialiser: Initialiser<Nav>) {
		const nav = this.nav = new Nav().appendTo(this);
		initialiser(nav);
		return this;
	}
}

export class ArticleSection extends Element {

	protected heading = new Heading(3)
		.appendTo(this);

	public constructor (title: string) {
		super("section");
		this.heading.id(createID(title)).text(title);
	}
}
