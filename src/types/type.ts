export type  Types = 'registration' | 'identification'

type ParamsRegistration = {
    userPhone: string,
    userId: string,
    isSavePhoto: '0'| '1',
    type: Types
}

export type ParamsType = ParamsRegistration | null
