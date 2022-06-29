import { GraphQLSchema, IntrospectionQuery } from 'graphql';
export interface GQLSchemaState {
    introspection?: IntrospectionQuery;
    schema?: GraphQLSchema;
    sdl: string;
    allowIntrospection: boolean;
    lastUpdatedAt?: number;
}
//# sourceMappingURL=gql-schema.interfaces.d.ts.map