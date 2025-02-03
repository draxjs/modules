import {describe, beforeEach, it, vi, expect} from "vitest"
import {SettingService} from '../../src/services/SettingService';
import {ISettingRepository} from '../../src/interfaces/ISettingRepository';
import {ISetting, ISettingBase} from '@drax/settings-share';
import {IDraxPaginateResult} from "@drax/crud-share";

// Mock implementation of ISettingRepository
class MockSettingRepository implements ISettingRepository {
    async findOneBy(field: string, value: string): Promise<ISetting | undefined> {
        if (field === 'key' && value === 'existingKey') {
            return {
                id: '1',
                key: 'existingKey',
                value: 'existingValue',
                label: 'Existing Key Label',
                group: 'Default Group',
                type: 'string',
                options: []
            } as ISetting;
        }
        return undefined;
    }

    async fetchAll(): Promise<ISetting[]> {
        return [{
            id: '1',
            key: 'existingKey',
            value: 'existingValue',
            label: 'Existing Key Label', // Add missing properties
            group: 'Default Group',
            type: 'string',
            options: []
        }];

    }

    async create(data: ISettingBase): Promise<ISetting> {
        return {id: '2', ...data} as ISetting;
    }

    async update(id: string, data: ISettingBase): Promise<ISetting> {
        return {id, ...data} as ISetting;
    }

    async updatePartial(id: string, data: Partial<ISettingBase>): Promise<ISetting | undefined> {
        return {id, ...data} as ISetting;
    }

    async paginate(): Promise<IDraxPaginateResult<ISetting>> {
        return { page: 1, limit: 5, total: 1, items: [
            {
                id: '1',
                key: 'existingKey',
                value: 'existingValue',
                label: 'Existing Key Label',
                group: 'Default Group',
                type: 'string',
                options: []
            }
        ] };
    }

    async delete(id: string): Promise<boolean> {
        return true;
    }
}

function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

describe('SettingService', () => {
    let settingService: SettingService;
    let mockRepository: MockSettingRepository;

    beforeEach(() => {
        mockRepository = new MockSettingRepository();
        settingService = new SettingService(mockRepository);
    });

    it('should successfully create a setting when valid data is provided', async () => {
        // Arrange
        const validData: ISettingBase = {
            key: 'newKey',
            value: 'newValue',
            label: 'New Key Label',
            group: 'Default Group',
            type: 'string',
            options: []
        };
        const expectedSetting = {id: '2', ...validData};

        // Act
        const createdSetting = await settingService.create(validData);

        // Assert
        expect(createdSetting).toEqual(expectedSetting);
    });

    it('should throw a validation error when creating a setting with invalid data', async () => {
        // Arrange
        const invalidData: ISettingBase = {
            key: '',
            value: 'someValue',
            label: 'Invalid Label',
            group: 'Invalid Group',
            type: 'string',
            options: []
        }; // Assuming an empty key is invalid

        // Act & Assert
        await expect(settingService.create(invalidData)).rejects.toThrowError();
    });

    it('should update an existing setting when valid data is provided', async () => {
        // Arrange
        const existingSetting = {id: '1', key: 'existingKey', value: 'existingValue'};
        const updatedData: ISettingBase = {
            key: 'existingKey',
            value: 'updatedValue',
            label: 'Existing Key Label',
            group: 'Default Group',
            type: 'string',
            options: []
        };
        const expectedUpdatedSetting: ISetting = {
            id: '1',
            key: 'existingKey',
            value: 'updatedValue',
            label: 'Existing Key Label',
            group: 'Default Group',
            type: 'string',
            options: []
        };

        // Mock the repository's update method
        vi.spyOn(mockRepository, 'update').mockResolvedValue(expectedUpdatedSetting);

        // Act
        const updatedSetting = await settingService.update(existingSetting.id, updatedData);

        // Assert
        expect(updatedSetting).toEqual(expectedUpdatedSetting);
        expect(mockRepository.update).toHaveBeenCalledWith(existingSetting.id, updatedData);
    });

    it('should cache a setting after fetching it by cache method and only call findByKey once', async () => {
        // Arrange
        const key = 'existingKey';
        const expectedSetting: ISetting = {
            id: '1',
            key: 'existingKey',
            value: 'existingValue',
            label: 'Existing Key Label',
            group: 'Default Group',
            type: 'string',
            options: []
        };

        // Mock the repository's findOneBy method
        const findOneBySpy = vi.spyOn(mockRepository, 'findOneBy').mockResolvedValue(expectedSetting);

        // Act
        const firstFetch = await settingService.cache(key);
        sleep(100)
        const secondFetch = await settingService.cache(key);

        // Assert
        expect(firstFetch).toEqual(expectedSetting);
        expect(secondFetch).toEqual(expectedSetting);
        expect(findOneBySpy).toHaveBeenCalledTimes(1);
    });

    it('should return all settings when fetchAll is called', async () => {
        // Arrange
        const expectedSettings = [{
            id: '1',
            key: 'existingKey',
            value: 'existingValue',
            label: 'Existing Key Label',
            group: 'Default Group',
            type: 'string',
            options: []
        }];

        // Act
        const settings = await settingService.fetchAll();

        // Assert
        expect(settings).toEqual(expectedSettings);
    });

    it('should update the value of a setting when a valid ID and value are provided', async () => {
        // Arrange
        const settingId = '1';
        const newValue = 'newUpdatedValue';
        const expectedUpdatedSetting: ISetting = {
            id: settingId,
            key: 'existingKey',
            value: newValue,
            label: 'Existing Key Label',
            group: 'Default Group',
            type: 'string',
            options: []
        };

        // Mock the repository's updatePartial method
        vi.spyOn(mockRepository, 'updatePartial').mockResolvedValue(expectedUpdatedSetting);

        // Act
        const updatedSetting = await settingService.updateValue(settingId, newValue);

        // Assert
        expect(updatedSetting).toEqual(expectedUpdatedSetting);
        expect(mockRepository.updatePartial).toHaveBeenCalledWith(settingId, {value: newValue});
    });

    it('should create a new setting if it does not exist when createOrUpdate is called', async () => {
        // Arrange
        const newSettingData: ISettingBase = {
            key: 'newKey',
            value: 'newValue',
            label: 'New Key Label',
            group: 'Default Group',
            type: 'string',
            options: []
        };
        const expectedNewSetting: ISetting = {
            id: '2',
            key: 'newKey',
            value: 'newValue',
            label: 'New Key Label',
            group: 'Default Group',
            type: 'string',
            options: []
        };

        // Mock the repository's findOneBy and create methods
        vi.spyOn(mockRepository, 'findOneBy').mockResolvedValue(undefined);
        vi.spyOn(mockRepository, 'create').mockResolvedValue(expectedNewSetting);

        // Act
        const result = await settingService.createOrUpdate(newSettingData);

        // Assert
        expect(mockRepository.findOneBy).toHaveBeenCalledWith('key', newSettingData.key);
        expect(mockRepository.create).toHaveBeenCalledWith(newSettingData);
        expect(result).toEqual(expectedNewSetting);
    });

    it('should update an existing setting if it exists when createOrUpdate is called', async () => {
        // Arrange
        const existingSetting: ISetting = {
            id: '1',
            key: 'existingKey',
            value: 'oldValue',
            label: 'Existing Key Label',
            group: 'Default Group',
            type: 'string',
            options: []
        };
        const updatedData: ISettingBase = {
            key: 'existingKey',
            value: 'newValue',
            label: 'Existing Key Label',
            group: 'Default Group',
            type: 'string',
            options: []
        };
        const expectedUpdatedSetting: ISetting = {
            id: '1',
            key: 'existingKey',
            value: 'oldValue',
            label: 'Existing Key Label',
            group: 'Default Group',
            type: 'string',
            options: []
        };

        // Mock the repository's findOneBy and update methods
        vi.spyOn(mockRepository, 'findOneBy').mockResolvedValue(existingSetting);
        vi.spyOn(mockRepository, 'updatePartial').mockResolvedValue(expectedUpdatedSetting);

        // Act
        const result = await settingService.createOrUpdate(updatedData);

        // Assert
        expect(mockRepository.findOneBy).toHaveBeenCalledWith('key', updatedData.key);
        expect(mockRepository.updatePartial).toHaveBeenCalledWith(existingSetting.id, updatedData);
        expect(result).toEqual(expectedUpdatedSetting);
    });

    it('should return undefined when trying to find a setting by a non-existent key', async () => {
        // Arrange
        const nonExistentKey = 'nonExistentKey';

        // Act
        const result = await settingService.findByKey(nonExistentKey);

        // Assert
        expect(result).toBeUndefined();
    });

    it('should throw a validation error when updating a setting with invalid data', async () => {
        // Arrange
        const invalidData: ISettingBase = {
            key: '',
            value: 'someValue',
            label: '',
            group: '',
            type: 'string',
            options: []
        }; // Assuming an empty key is invalid
        const settingId = '1'; // Example setting ID

        // Act & Assert
        await expect(settingService.update(settingId, invalidData)).rejects.toThrowError();
    });
});
