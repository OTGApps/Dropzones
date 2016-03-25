//
//  SHPAddressUtils.m
//  ShypAddressParser
//
//  Created by Alaric Cole on 2/14/14.
//  Copyright (c) 2014 Alaric Cole. All rights reserved.
//

#import "SHPAddressUtils.h"

@implementation SHPAddressUtils

/*
 * Parses out individual parts of an address when supplied with a block of text.
 * @param address A block of text, typically line or comma delimited. eg:
 * Alaric Cole
 * 13 Lucky St.
 * San Francisco, CA 94107
 *
 *
 * Caveats:
 *	   Only tested for US addresses. Assuming support for international addresses is not as robust
 *     Names don't appear to be parsed, contrary to documentation. Here it is done manually.
 *     There's no built-in support for parsing Apartment/unit numbers apart from the street address.
 */
+(NSDictionary*)addressComponentsFromAddress:(NSString*)address
{
	__block NSMutableDictionary * addressDictionary;

	NSError *error = nil;
	NSDataDetector *detector = [NSDataDetector dataDetectorWithTypes:NSTextCheckingTypeAddress  error:&error];

	[detector enumerateMatchesInString:address options:0 range:NSMakeRange(0, address.length) usingBlock:^(NSTextCheckingResult *match, NSMatchingFlags flags, BOOL *stop) {
		if ([match resultType] == NSTextCheckingTypeAddress)
        {

            addressDictionary = [match addressComponents].mutableCopy;

			NSString *name = addressDictionary[NSTextCheckingNameKey];
			//the name does not seem to get populated
			//if not, grab the first part of the string
			if (!name && match.range.location > 0) {
				// grab string from beginning of string to beginning of this match
				//TODO: strip out organization if necessary
				name = [address substringToIndex:match.range.location - 1];

				//force it in
				if(name) addressDictionary[NSTextCheckingNameKey] = name;

			}

            //NSLog(@"addressComponents  %@",addressDictionary);

			*stop = YES;
		}

	}];

	//cleanup and remove whitespace
	[addressDictionary.copy enumerateKeysAndObjectsUsingBlock:^(id key, NSString* obj, BOOL *stop) {
		addressDictionary[key] = [obj stringByTrimmingCharactersInSet:[NSCharacterSet whitespaceAndNewlineCharacterSet]];

	}];

	return addressDictionary.copy;

}

@end
