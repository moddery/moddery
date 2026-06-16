import { Field, Int, ObjectType } from '@nestjs/graphql';
import { type ProjectKind, type ProjectStatus } from '@moddery/shared';

@ObjectType()
export class ProjectGalleryImage {
  @Field(() => Date)
  createdAt!: Date;

  @Field(() => String, { nullable: true })
  description!: string | null;

  @Field(() => String)
  displayUrl!: string;

  @Field(() => Boolean)
  featured!: boolean;

  @Field(() => String)
  rawUrl!: string;

  @Field(() => Int)
  sortOrder!: number;

  @Field(() => String, { nullable: true })
  title!: string | null;
}

@ObjectType()
export class ProjectSummary {
  @Field(() => String)
  body!: string;

  @Field(() => [String])
  categories!: string[];

  @Field(() => Int)
  downloads!: number;

  @Field(() => Int)
  followers!: number;

  @Field(() => [String])
  gameVersions!: string[];

  @Field(() => String)
  id!: string;

  @Field(() => String, { nullable: true })
  iconUrl!: string | null;

  @Field(() => String)
  kind!: ProjectKind;

  @Field(() => [String])
  loaders!: string[];

  @Field(() => [ProjectGalleryImage])
  gallery!: ProjectGalleryImage[];

  @Field(() => String)
  slug!: string;

  @Field(() => String)
  status!: ProjectStatus;

  @Field(() => String)
  summary!: string;

  @Field(() => String)
  title!: string;

  @Field(() => Date)
  updatedAt!: Date;
}
