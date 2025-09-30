import { Injectable } from '@angular/core'
import {
    AuthChangeEvent,
    AuthSession,
    createClient,
    Session,
    SupabaseClient,
    User,
} from '@supabase/supabase-js'
import { environment } from '../environments/environment'

export interface Profile {
    id?: string
    username: string
}

@Injectable({
    providedIn: 'root',
})

export class SupabaseService {
    private supabase: SupabaseClient
    _session: AuthSession | null = null

    constructor() {
        this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey)
    }

    get session() {
        this.supabase.auth.getSession().then(({ data }) => {
            this._session = data.session
        })
        return this._session
    }

    profile(user: User) {
        return this.supabase
            .from('profiles')
            .select(`username`)
            .eq('id', user.id)
            .single()
    }

    authChanges(callback: (event: AuthChangeEvent, session: Session | null) => void) {
        return this.supabase.auth.onAuthStateChange(callback)
    }

    signIn(email: string, password: string) {
        return this.supabase.auth.signInWithPassword({ email, password })
    }

    register(firstName: string, lastName: string, email: string, password: string, confirmedPassword: string) {
        if (password !== confirmedPassword) {
            throw new Error("Passwords do not match");
        }
        return this.supabase.auth.signUp({ email, password })
    }

    signOut() {
        return this.supabase.auth.signOut()
    }

    updateProfile(profile: Profile) {
        const update = {
            ...profile,
            updated_at: new Date(),
        }

        return this.supabase.from('profiles').upsert(update)
    }

    createUserProfile(userId: string, firstName: string, lastName: string, email: string) {
        return this.supabase.from('USER').insert({
            User_ID: userId,
            user_firstName: firstName,
            user_lastName: lastName,
            user_email: email
        })
    }
}