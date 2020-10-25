// Copyright (c) The NodeRT Contributors
// All rights reserved.
//
// Licensed under the Apache License, Version 2.0 (the ""License""); you may
// not use this file except in compliance with the License. You may obtain a
// copy of the License at http://www.apache.org/licenses/LICENSE-2.0
//
// THIS CODE IS PROVIDED ON AN  *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS
// OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY
// IMPLIED WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
// MERCHANTABLITY OR NON-INFRINGEMENT.
//
// See the Apache Version 2.0 License for specific language governing
// permissions and limitations under the License.

#include "CollectionsConverterUtils.h"

namespace std {
bool operator==(const ::Windows::Foundation::TimeSpan& first,
                const ::Windows::Foundation::TimeSpan& second) {
  return first.Duration == second.Duration;
}

bool operator==(
    const ::Windows::Devices::Geolocation::BasicGeoposition& first,
    const ::Windows::Devices::Geolocation::BasicGeoposition& second) {
  return (first.Altitude == second.Altitude) &&
         (first.Latitude == second.Latitude) &&
         (first.Longitude == second.Longitude);
}

bool operator==(const ::Windows::Storage::Search::SortEntry& first,
                const ::Windows::Storage::Search::SortEntry& second) {
  return (first.AscendingOrder == second.AscendingOrder) &&
         (first.PropertyName == second.PropertyName);
}

bool operator==(const ::Windows::Data::Text::TextSegment& first,
                const ::Windows::Data::Text::TextSegment& second) {
  return (first.Length == second.Length) &&
         (first.StartPosition == second.StartPosition);
}

}  // namespace std
