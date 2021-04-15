type Localized<T> = {
  values: {
    locale: string
    value: T
  }[]
  _meta: { schema: string }
}

export const localize = <T>(value: T, locale: string): Localized<T> => ({
  values: [
    {
      locale,
      value,
    },
  ],
  _meta: {
    schema: 'http://bigcontent.io/cms/schema/v1/core#/definitions/localized-value',
  },
})

export const unLocalize = <T>(value: Localized<T>, locale: string, fallBack: T) =>
  value.values.find((f) => f.locale === locale)?.value ?? fallBack

export const renameProperty = <T extends object, P extends keyof T, PN extends string>(
  value: T,
  propName: P,
  newName: PN
) =>
  ({
    ...value,
    [newName]: value[propName],
    [propName]: undefined,
  } as { [p in PN]: T[P] } &
    {
      [K in Exclude<keyof T, P>]: T[K]
    })

export const deleteProperty = <T extends object, P extends keyof T>(
  value: T,
  propName: P
): {
  [K in Exclude<keyof T, P>]: T[K]
} => ({
  ...value,
  [propName]: undefined,
})

export const addProperty = <T extends object, P extends string, V>(
  value: T,
  propName: P,
  propValue: (context: T) => V
) => ({ ...value, [propName]: propValue(value) } as T & { [p in P]: V })

export const transformProperty = <T extends object, P extends keyof T, V>(
  value: T,
  propName: P,
  propValue: (propContext: T[P], context: T) => V
) =>
  ({ ...value, [propName]: propValue(value[propName], value) } as { [p in P]: V } &
    {
      [K in Exclude<keyof T, P>]: T[K]
    })
