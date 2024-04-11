import { Message, Persona } from "@shared/db_types";

// Card
// =====================================
// data.json inside the card's directory
export interface CardData {
  spec: string;
  spec_version: string;
  character: Character;
  world: World;
  meta: {
    title: string;
    created_at: string;
    updated_at?: string;
    creator: {
      card: string;
      character: string;
      world: string;
    };
    notes?: string;
    tagline: string;
    tags: string[];
  };
}

export interface Character {
  name: string;
  description: string;
  greeting: string;
  alt_greetings: string[];
  msg_examples: string;
}
export interface World {
  description: string;
}
// Contents of the card's directory
export interface CardBundle {
  data: CardData;
  avatarURI: string;
  bannerURI: string;
}
// =====================================

// Persona
// =====================================
export interface PersonaData extends Pick<Persona, "name" | "description"> {}

// Contents of the persona's directory
export interface PersonaBundleWithoutData {
  avatarURI: string;
}

export interface PersonaBundle extends PersonaBundleWithoutData {
  data: PersonaData;
}
// =====================================

export interface UIMessage extends Pick<Message, "id" | "sender" | "text" | "inserted_at"> {}