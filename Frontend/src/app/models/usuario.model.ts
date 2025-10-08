export interface UsuarioModel {
    id_user: string
    username: string
    fullname: string
    role: string
    cargo: string
    email: string
    ramal: string
    dataCadastro: string
    avatarUrl?: string
}

export interface PasswordModel{
    oldPassword: string
    newPassword: string
}