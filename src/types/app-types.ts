export type ApiError = {
	name: string
	message: string
}

export type ApiResponse = {
	success: boolean
	message: string | null
	data: [] | null
	errors: ApiError[]
}

export type BranchDto = {
	Id: number
	Name: string
}

export type DoctorDto = {
	Id: number
	Name: string
}

export type IntervalDto = {
	BranchId: number
	DoctorId: number
	StartDateTime: string
	LengthInMinutes: number
	IsBusy: boolean
}
