import UserServiceFactory from './UserServiceFactory.js';
import UserVerificationService from '../services/UserVerificationService.js';

let service: UserVerificationService;

export default function UserVerificationServiceFactory(): UserVerificationService {
    return service ??= new UserVerificationService(UserServiceFactory()._repository);
}
